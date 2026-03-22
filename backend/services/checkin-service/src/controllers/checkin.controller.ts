import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Ticket } from '../models/ticket.model';
import { CheckinLog } from '../models/checkinLog.model';

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

