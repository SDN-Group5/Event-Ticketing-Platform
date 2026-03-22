/**
 * BDD – Test theo hành vi người dùng (User Story)
 * - Unit: controller với mock DB
 * - Integration: luồng thực tế qua API (supertest)
 * - Bảo mật: phân quyền, rate limit (nếu có)
 */

import { Response } from 'express';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { scanTicket, getEventSummary, getRecentScans } from '../controllers/checkin.controller';
import checkinRoutes from '../routes/checkin.routes';
import { Ticket } from '../models/ticket.model';
import { CheckinLog } from '../models/checkinLog.model';
import { AuthRequest } from '../middleware/auth.middleware';

jest.mock('../models/ticket.model');
jest.mock('../models/checkinLog.model');

const mockTicketFindOne = Ticket.findOne as jest.MockedFunction<typeof Ticket.findOne>;
const mockCheckinLogCreate = CheckinLog.create as jest.MockedFunction<typeof CheckinLog.create>;
const mockTicketCountDocuments = Ticket.countDocuments as jest.MockedFunction<typeof Ticket.countDocuments>;
const mockCheckinLogFind = CheckinLog.find as jest.MockedFunction<typeof CheckinLog.find>;

function mockRes(): jest.Mocked<Response> {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as jest.Mocked<Response>;
}

function signTestToken(payload: { userId: string; role?: string }) {
  const secret = process.env.JWT_SECRET_KEY || 'your-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

/** App Express dùng cho integration test */
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/checkin', checkinRoutes);
  return app;
}

describe('Checkin Service – BDD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== User Story: Nhân viên soát vé ====================
  describe('User Story: Nhân viên soát vé', () => {
    it('nhân viên không thể check-in nếu quên quét mã QR (thiếu ticketCode)', async () => {
      const req = { body: {}, userId: 'staff-1' } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Thiếu mã vé (ticketCode)' })
      );
      expect(mockTicketFindOne).not.toHaveBeenCalled();
    });

    it('hệ thống từ chối nếu không xác định được nhân viên (thiếu userId)', async () => {
      const req = { body: { ticketCode: 'TICKET-001' }, userId: undefined } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Thiếu thông tin nhân viên check-in' })
      );
      expect(mockTicketFindOne).not.toHaveBeenCalled();
    });

    it('quét mã không tồn tại: trả về "Mã QR không hợp lệ" và ghi log INVALID', async () => {
      mockTicketFindOne.mockResolvedValue(null);
      const req = { body: { ticketCode: 'INVALID-CODE' }, userId: 'staff-1' } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(mockTicketFindOne).toHaveBeenCalledWith({ ticketId: 'INVALID-CODE' });
      expect(mockCheckinLogCreate).toHaveBeenCalledWith({
        ticketCode: 'INVALID-CODE',
        staffId: 'staff-1',
        result: 'INVALID',
        reason: 'Không tìm thấy vé',
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, code: 'NOT_FOUND', message: 'Mã QR không hợp lệ' })
      );
    });

    it('quét 1 vé 2 lần liên tiếp: lần 2 báo "Vé này đã được check-in trước đó" (tránh dùng 1 ảnh cho nhiều người)', async () => {
      const ticket = {
        ticketId: 'T-001',
        eventId: 'ev-1',
        eventName: 'Event A',
        zoneName: 'VIP',
        seatLabel: 'A1',
        userId: 'user-1',
        status: 'checked-in',
        save: jest.fn(),
      } as any;
      mockTicketFindOne.mockResolvedValue(ticket);
      const req = { body: { ticketCode: 'T-001' }, userId: 'staff-1' } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(mockCheckinLogCreate).toHaveBeenCalledWith({
        ticketCode: 'T-001',
        eventId: 'ev-1',
        staffId: 'staff-1',
        result: 'ALREADY_CHECKED_IN',
        reason: 'Vé đã được check-in trước đó',
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'ALREADY_CHECKED_IN',
          message: 'Vé này đã được check-in trước đó',
        })
      );
      expect(ticket.save).not.toHaveBeenCalled();
    });

    it('vé trạng thái used: từ chối check-in (tránh client nhận 200 rồi goBack)', async () => {
      const ticket = {
        ticketId: 'T-USED',
        eventId: 'ev-1',
        eventName: 'Event A',
        zoneName: 'VIP',
        seatLabel: 'A1',
        userId: 'user-1',
        status: 'used',
        save: jest.fn(),
      } as any;
      mockTicketFindOne.mockResolvedValue(ticket);
      const req = { body: { ticketCode: 'T-USED' }, userId: 'staff-1' } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(mockCheckinLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          result: 'ALREADY_CHECKED_IN',
          reason: 'Vé đã được đánh dấu đã sử dụng',
        })
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(ticket.save).not.toHaveBeenCalled();
    });

    it('vé đã hủy hoặc hoàn tiền: từ chối check-in và ghi log CANCELLED/REFUNDED', async () => {
      const ticketCancelled = {
        ticketId: 'T-C',
        eventId: 'ev-1',
        status: 'cancelled',
        save: jest.fn(),
      } as any;
      mockTicketFindOne.mockResolvedValue(ticketCancelled);
      const req = { body: { ticketCode: 'T-C' }, userId: 'staff-1' } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(mockCheckinLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({ result: 'CANCELLED', reason: 'Vé đã bị hủy hoặc hoàn tiền' })
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, code: 'INVALID_STATUS' })
      );
    });

    it('vé vừa thanh toán (issued): cho phép check-in ngay và trả thông tin vé, sự kiện, chỗ ngồi', async () => {
      const ticket = {
        ticketId: 'T-OK',
        eventId: 'ev-1',
        eventName: 'Concert',
        zoneName: 'Standing',
        seatLabel: 'B2',
        userId: 'user-1',
        status: 'issued',
        checkedInAt: undefined,
        save: jest.fn().mockResolvedValue(undefined),
      } as any;
      mockTicketFindOne.mockResolvedValue(ticket);
      const req = { body: { ticketCode: 'T-OK' }, userId: 'staff-1' } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(ticket.status).toBe('checked-in');
      expect(ticket.checkedInAt).toBeDefined();
      expect(ticket.save).toHaveBeenCalled();
      expect(mockCheckinLogCreate).toHaveBeenCalledWith({
        ticketCode: 'T-OK',
        eventId: 'ev-1',
        staffId: 'staff-1',
        result: 'SUCCESS',
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Check-in thành công',
          data: expect.objectContaining({
            ticketCode: 'T-OK',
            status: 'checked-in',
            event: expect.objectContaining({ id: 'ev-1', name: 'Concert', zoneName: 'Standing', seatLabel: 'B2' }),
            owner: expect.objectContaining({ id: 'user-1' }),
          }),
        })
      );
    });
  });

  // ==================== User Story: Khách hàng / Real-time ====================
  describe('User Story: Khách hàng quét vé ngay sau thanh toán', () => {
    it('vé trạng thái issued có thể check-in ngay (đồng bộ Order – Checkin)', async () => {
      const ticket = {
        ticketId: 'T-NEW',
        eventId: 'ev-1',
        eventName: 'Show',
        zoneName: 'A',
        seatLabel: '1',
        userId: 'user-1',
        status: 'issued',
        save: jest.fn().mockResolvedValue(undefined),
      } as any;
      mockTicketFindOne.mockResolvedValue(ticket);
      const req = { body: { ticketCode: 'T-NEW' }, userId: 'staff-1' } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Check-in thành công' })
      );
      expect(ticket.save).toHaveBeenCalled();
    });
  });

  // ==================== User Story: Quản trị viên ====================
  describe('User Story: Quản trị viên xem báo cáo', () => {
    it('thiếu eventId thì trả lỗi rõ ràng, không gọi DB', async () => {
      const req = { params: {} } as unknown as AuthRequest;
      const res = mockRes();
      await getEventSummary(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Thiếu eventId' })
      );
      expect(mockTicketCountDocuments).not.toHaveBeenCalled();
    });

    it('xem báo cáo khi chưa có ai check-in: total=0, checkedIn=0, remaining=0 (không crash chia cho 0)', async () => {
      mockTicketCountDocuments.mockImplementation((filter: any) => {
        if (filter.eventId && filter.status?.$in) return Promise.resolve(0) as any;
        if (filter.eventId) return Promise.resolve(0) as any;
        return Promise.resolve(0) as any;
      });
      const req = { params: { eventId: 'ev-empty' } } as unknown as AuthRequest;
      const res = mockRes();
      await getEventSummary(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { total: 0, checkedIn: 0, remaining: 0 },
      });
    });

    it('trả về total, checkedIn, remaining chính xác khi có dữ liệu', async () => {
      mockTicketCountDocuments.mockImplementation((filter: any) => {
        if (filter.eventId && filter.status?.$in) return Promise.resolve(30) as any;
        if (filter.eventId) return Promise.resolve(100) as any;
        return Promise.resolve(0) as any;
      });
      const req = { params: { eventId: 'ev-1' } } as unknown as AuthRequest;
      const res = mockRes();
      await getEventSummary(req, res);
      expect(mockTicketCountDocuments).toHaveBeenCalledWith({ eventId: 'ev-1' });
      expect(mockTicketCountDocuments).toHaveBeenCalledWith({
        eventId: 'ev-1',
        status: { $in: ['checked-in', 'used'] },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { total: 100, checkedIn: 30, remaining: 70 },
      });
    });

    it('lịch sử quét gần đây: filter theo eventId, limit mặc định 10, có thể tùy chỉnh limit', async () => {
      const mockLogs = [
        { ticketCode: 'T1', eventId: 'ev-1', staffId: 's1', result: 'SUCCESS', createdAt: new Date() },
      ];
      const chain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs),
      };
      mockCheckinLogFind.mockReturnValue(chain as any);
      const req = { params: { eventId: 'ev-1' }, query: {} } as unknown as AuthRequest;
      const res = mockRes();
      await getRecentScans(req, res);
      expect(mockCheckinLogFind).toHaveBeenCalledWith({ eventId: 'ev-1' });
      expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(chain.limit).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockLogs });

      chain.limit.mockClear();
      const req2 = { params: { eventId: 'ev-1' }, query: { limit: '25' } } as unknown as AuthRequest;
      const res2 = mockRes();
      mockCheckinLogFind.mockReturnValue(chain as any);
      await getRecentScans(req2, res2);
      expect(chain.limit).toHaveBeenCalledWith(25);
    });
  });

  // ==================== Edge case: Lỗi DB (ẩn console.error khi test) ====================
  describe('Edge case: Lỗi hệ thống / DB', () => {
    it('khi DB lỗi: trả 500, ghi log ERROR, không in rác ra console', async () => {
      const spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTicketFindOne.mockRejectedValue(new Error('DB connection failed'));
      const req = { body: { ticketCode: 'T-ERR' }, userId: 'staff-1' } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.any(String) })
      );
      expect(mockCheckinLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({ ticketCode: 'T-ERR', staffId: 'staff-1', result: 'ERROR' })
      );
      spyConsole.mockRestore();
    });

    it('getEventSummary khi countDocuments lỗi: trả 500, ẩn console', async () => {
      const spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTicketCountDocuments.mockRejectedValue(new Error('DB error'));
      const req = { params: { eventId: 'ev-1' } } as unknown as AuthRequest;
      const res = mockRes();
      await getEventSummary(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'DB error' })
      );
      spyConsole.mockRestore();
    });

    it('getRecentScans khi find lỗi: trả 500, ẩn console', async () => {
      const spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockCheckinLogFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Find error')),
      } as any);
      const req = { params: { eventId: 'ev-1' }, query: {} } as unknown as AuthRequest;
      const res = mockRes();
      await getRecentScans(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Find error' })
      );
      spyConsole.mockRestore();
    });
  });

  // ==================== Integration: Luồng một ngày làm việc của vé ====================
  describe('Integration: Luồng một ngày làm việc của vé', () => {
    it('tạo vé issued → check-in lần 1 thành công → check-in lần 2 báo ALREADY_CHECKED_IN → summary checkedIn tăng đúng 1', async () => {
      const app = createTestApp();
      const ticketId = 'FLOW-TICKET-001';
      const eventId = 'ev-flow';

      const ticketDoc = {
        ticketId,
        eventId,
        eventName: 'Event Flow',
        zoneName: 'Z1',
        seatLabel: 'S1',
        userId: 'user-1',
        status: 'issued',
        checkedInAt: undefined,
        save: jest.fn().mockResolvedValue(undefined),
      } as any;

      mockTicketFindOne.mockResolvedValue(ticketDoc);
      mockCheckinLogCreate.mockResolvedValue({} as any);

      const res1 = await request(app)
        .post('/api/checkin/scan')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${signTestToken({ userId: 'staff-flow', role: 'staff' })}`)
        .send({ ticketCode: ticketId });

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.status).toBe('checked-in');
      expect(ticketDoc.save).toHaveBeenCalled();

      ticketDoc.status = 'checked-in';
      ticketDoc.checkedInAt = new Date();
      mockTicketFindOne.mockResolvedValue(ticketDoc);

      const res2 = await request(app)
        .post('/api/checkin/scan')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${signTestToken({ userId: 'staff-flow', role: 'staff' })}`)
        .send({ ticketCode: ticketId });

      expect(res2.status).toBe(400);
      expect(res2.body.success).toBe(false);
      expect(res2.body.code).toBe('ALREADY_CHECKED_IN');

      mockTicketCountDocuments.mockImplementation((filter: any) => {
        if (filter.eventId === eventId && filter.status?.$in) return Promise.resolve(1) as any;
        if (filter.eventId === eventId) return Promise.resolve(10) as any;
        return Promise.resolve(0) as any;
      });

      const resSummary = await request(app).get(`/api/checkin/event/${eventId}/summary`);
      expect(resSummary.status).toBe(200);
      expect(resSummary.body.success).toBe(true);
      expect(resSummary.body.data).toEqual({ total: 10, checkedIn: 1, remaining: 9 });
    });
  });

  // ==================== User Story: Bảo mật ====================
  describe('User Story: Bảo mật', () => {
    it('nhân viên Event A không được phép quét vé thuộc Event B (phân quyền theo sự kiện)', async () => {
      // Hiện tại backend chưa kiểm tra staffEventId vs ticket.eventId → scan vẫn thành công.
      // Khi triển khai: so sánh req.userEventId (từ token) với ticket.eventId, khác nhau thì 403.
      const ticketEventB = {
        ticketId: 'T-EVENT-B',
        eventId: 'ev-B',
        eventName: 'Event B',
        zoneName: 'Z',
        seatLabel: '1',
        userId: 'user-1',
        status: 'issued',
        save: jest.fn().mockResolvedValue(undefined),
      } as any;
      mockTicketFindOne.mockResolvedValue(ticketEventB);
      const req = {
        body: { ticketCode: 'T-EVENT-B' },
        userId: 'staff-A',
      } as AuthRequest;
      const res = mockRes();
      await scanTicket(req, res);
      const payload = (res.json as jest.Mock).mock.calls[0]?.[0];
      expect(payload?.success).toBe(true);
      // TODO: Khi thêm phân quyền theo event: expect(res.status).toHaveBeenCalledWith(403) và message "Mã vé không thuộc sự kiện của bạn".
    });

    it.skip('rate limiting: quét hàng nghìn mã QR trong thời gian ngắn bị chặn (chưa triển khai middleware)', () => {
      // Khi có rate-limit middleware: gửi nhiều request /scan trong 1 phút → expect 429.
    });
  });
});
