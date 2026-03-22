import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Ticket } from '../models/ticket.model';
import { CheckinLog } from '../models/checkinLog.model';
import { StaffRequest } from '../models/staffRequest.model';
import axios from 'axios';

/** Tách eventIds từ query string: "id1,id2,id3" hoặc "id1" */
function parseEventIds(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const str = Array.isArray(raw) ? raw.join(',') : raw;
  return str.split(',').map((s) => s.trim()).filter(Boolean);
}

export const scanTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketCode, staffId: staffIdFromBody } = req.body as { ticketCode?: string; staffId?: string };
    const staffId = req.userId || staffIdFromBody;

    if (!ticketCode) {
      return res.status(400).json({ success: false, message: 'Thiếu mã vé (ticketCode)' });
    }

    if (!staffId) {
      return res.status(401).json({ success: false, message: 'Thiếu thông tin nhân viên check-in' });
    }

    const ticket = await Ticket.findOne({ ticketId: ticketCode });

    if (!ticket) {
      await CheckinLog.create({
        ticketCode,
        staffId,
        result: 'INVALID',
        reason: 'Không tìm thấy vé',
      });

      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Mã QR không hợp lệ' });
    }

    // checked-in và used đều là vé đã qua cửa — không cho check-in lại (tránh app client coi là 200 rồi goBack / về màn hình trước).
    if (ticket.status === 'checked-in' || ticket.status === 'used') {
      await CheckinLog.create({
        ticketCode: ticket.ticketId,
        eventId: ticket.eventId,
        staffId,
        result: 'ALREADY_CHECKED_IN',
        reason:
          ticket.status === 'used'
            ? 'Vé đã được đánh dấu đã sử dụng'
            : 'Vé đã được check-in trước đó',
      });

      return res.status(400).json({
        success: false,
        code: 'ALREADY_CHECKED_IN',
        message: 'Vé này đã được check-in trước đó',
      });
    }

    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      await CheckinLog.create({
        ticketCode: ticket.ticketId,
        eventId: ticket.eventId,
        staffId,
        result: ticket.status === 'cancelled' ? 'CANCELLED' : 'REFUNDED',
        reason: 'Vé đã bị hủy hoặc hoàn tiền',
      });

      return res.status(400).json({
        success: false,
        code: 'INVALID_STATUS',
        message: 'Vé đã bị hủy hoặc hoàn tiền',
      });
    }

    // TODO: Optional - kiểm tra thời gian diễn ra sự kiện còn hợp lệ

    ticket.status = 'checked-in';
    ticket.checkedInAt = new Date();
    await ticket.save();

    await CheckinLog.create({
      ticketCode: ticket.ticketId,
      eventId: ticket.eventId,
      staffId,
      result: 'SUCCESS',
    });

    return res.json({
      success: true,
      message: 'Check-in thành công',
      data: {
        ticketCode: ticket.ticketId,
        status: ticket.status,
        checkedInAt: ticket.checkedInAt,
        event: {
          id: ticket.eventId,
          name: ticket.eventName,
          zoneName: ticket.zoneName,
          seatLabel: ticket.seatLabel,
        },
        owner: {
          id: ticket.userId,
        },
      },
    });
  } catch (err: any) {
    console.error('[Checkin] scanTicket error:', err?.message);

    try {
      const staffId = (req as AuthRequest).userId || 'unknown';
      const ticketCode = (req.body as any)?.ticketCode || 'unknown';
      await CheckinLog.create({
        ticketCode,
        staffId,
        result: 'ERROR',
        reason: err?.message || 'Internal error',
      });
    } catch {
      // ignore log errors
    }

    return res.status(500).json({ success: false, message: err?.message || 'Lỗi check-in' });
  }
};

export const getEventSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Thiếu eventId' });
    }

    const total = await Ticket.countDocuments({ eventId });
    const checkedIn = await Ticket.countDocuments({
      eventId,
      status: { $in: ['checked-in', 'used'] },
    });
    const remaining = total - checkedIn;

    return res.json({
      success: true,
      data: {
        total,
        checkedIn,
        remaining,
      },
    });
  } catch (err: any) {
    console.error('[Checkin] getEventSummary error:', err?.message);
    return res.status(500).json({ success: false, message: err?.message || 'Lỗi lấy thống kê' });
  }
};

/**
 * GET /api/checkin/records
 * Lấy danh sách vé theo eventIds, hỗ trợ filter status và search
 * Query: eventIds (comma-separated), status (issued|checked-in|all), page, limit, search (ticketCode)
 */
export const getTicketRecords = async (req: AuthRequest, res: Response) => {
  try {
    const eventIds = parseEventIds(req.query.eventIds as string | string[]);
    const status = (req.query.status as string) || 'all';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const search = (req.query.search as string | undefined)?.trim();

    const query: any = {};

    if (eventIds.length > 0) {
      query.eventId = { $in: eventIds };
    }

    if (status && status !== 'all') {
      if (status === 'pending') {
        query.status = 'issued';
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.ticketId = { $regex: search, $options: 'i' };
    }

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const data = tickets.map((t) => ({
      id: String(t._id),
      ticketCode: t.ticketId,
      userId: t.userId,
      eventId: t.eventId,
      eventName: t.eventName,
      zoneName: t.zoneName,
      seatLabel: t.seatLabel || null,
      price: t.price,
      status: t.status,
      checkInTime: t.checkedInAt ? t.checkedInAt.toISOString() : null,
    }));

    return res.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('[Checkin] getTicketRecords error:', err?.message);
    return res.status(500).json({ success: false, message: err?.message || 'Lỗi lấy danh sách vé' });
  }
};

/**
 * GET /api/checkin/statistics/summary
 * Thống kê check-in theo eventIds
 * Query: eventIds (comma-separated)
 */
export const getTicketStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const eventIds = parseEventIds(req.query.eventIds as string | string[]);

    const matchStage: any = {};
    if (eventIds.length > 0) {
      matchStage.eventId = { $in: eventIds };
    }

    const [total, checkedIn, cancelled] = await Promise.all([
      Ticket.countDocuments(matchStage),
      Ticket.countDocuments({ ...matchStage, status: { $in: ['checked-in', 'used'] } }),
      Ticket.countDocuments({ ...matchStage, status: { $in: ['cancelled', 'refunded'] } }),
    ]);

    const pending = total - checkedIn - cancelled;
    const checkInRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return res.json({
      success: true,
      data: {
        total,
        checkedIn,
        pending: Math.max(0, pending),
        cancelled,
        checkInRate,
      },
    });
  } catch (err: any) {
    console.error('[Checkin] getTicketStatistics error:', err?.message);
    return res.status(500).json({ success: false, message: err?.message || 'Lỗi lấy thống kê' });
  }
};

export const getRecentScans = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const limit = Number(req.query.limit) || 10;

    const query: any = {};
    if (eventId) {
      query.eventId = eventId;
    }

    const logs = await CheckinLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: logs,
    });
  } catch (err: any) {
    console.error('[Checkin] getRecentScans error:', err?.message);
    return res.status(500).json({ success: false, message: err?.message || 'Lỗi lấy lịch sử quét vé' });
  }
};

// --- NEW CONTROLLERS FOR STAFF ASSIGNMENT ---

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const LAYOUT_SERVICE_URL = process.env.LAYOUT_SERVICE_URL || 'http://localhost:4002';

export const requestAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.body;
    const staffId = req.userId;

    if (!eventId || !staffId) {
      return res.status(400).json({ success: false, message: 'Thiếu eventId hoặc staffId' });
    }

    // Kiểm tra xem đã có yêu cầu chưa
    const existing = await StaffRequest.findOne({ staffId, eventId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bạn đã gửi yêu cầu cho sự kiện này rồi' });
    }

    let staffName = 'Staff';
    let eventName = 'Sự kiện';
    let organizerId = '';

    // Lấy thông tin Staff từ Auth Service với Fallback
    try {
      const authBase = AUTH_SERVICE_URL.endsWith('/api') ? AUTH_SERVICE_URL : `${AUTH_SERVICE_URL}/api`;
      const staffProfile = await axios.get(`${authBase}/users/${staffId}`, {
        headers: { Authorization: req.headers.authorization },
        timeout: 5000 
      });
      const data = staffProfile.data?.data || staffProfile.data;
      if (data) {
        staffName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Staff';
      }
    } catch (e: any) {
      console.warn('[Checkin] Could not fetch staff name:', e.message);
    }

    // Lấy thông tin Sự kiện từ Layout Service với Fallback
    try {
      const layoutBase = LAYOUT_SERVICE_URL.endsWith('/api') ? LAYOUT_SERVICE_URL : `${LAYOUT_SERVICE_URL}/api`;
      // Thử gọi /v1/layouts (Gateway chuẩn) hoặc /layouts
      const eventLayout = await axios.get(`${layoutBase}/v1/layouts/event/${eventId}`, {
        headers: { Authorization: req.headers.authorization },
        timeout: 5000
      });
      const data = eventLayout.data?.data || eventLayout.data;
      if (data) {
        eventName = data.eventName || 'Sự kiện';
        organizerId = data.createdBy || '';
      }
    } catch (e: any) {
      console.warn('[Checkin] Could not fetch event info:', e.message);
    }

    const newRequest = await StaffRequest.create({
      staffId,
      staffName,
      eventId,
      eventName,
      organizerId,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Yêu cầu phụ trách đã được gửi tới Organizer',
      data: newRequest
    });
  } catch (err: any) {
    console.error('[Checkin] requestAssignment error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getStaffRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const staffId = req.userId;
    if (!eventId || !staffId) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });

    const request = await StaffRequest.findOne({ staffId, eventId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: request });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const organizerId = req.userId;
    const requests = await StaffRequest.find({ organizerId, status: 'pending' }).sort({ createdAt: -1 });
    return res.json({ success: true, data: requests });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEventStaffs = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ success: false, message: 'Thiếu eventId' });
    const organizerId = req.userId;
    // Tìm các staff đã được duyệt cho sự kiện này
    const staffs = await StaffRequest.find({ eventId, organizerId, status: 'approved' }).sort({ updatedAt: -1 });
    return res.json({ success: true, data: staffs });
  } catch (err: any) {
    console.error('[Checkin] getEventStaffs error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const approveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const organizerId = req.userId;

    const request = await StaffRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });

    if (request.organizerId !== organizerId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền duyệt yêu cầu này' });
    }

    request.status = 'approved';
    await request.save();

    // TODO: Có thể cập nhật quyền check-in thực tế vào User model hoặc một bảng phân quyền riêng
    // Hiện tại chỉ cần đánh dấu approved để app Mobile hiển thị.

    return res.json({ success: true, message: 'Đã phê duyệt yêu cầu' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const organizerId = req.userId;

    const request = await StaffRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });

    if (request.organizerId !== organizerId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền từ chối yêu cầu này' });
    }

    request.status = 'rejected';
    await request.save();

    return res.json({ success: true, message: 'Đã từ chối yêu cầu' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

