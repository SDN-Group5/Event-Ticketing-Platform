import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Ticket } from '../models/ticket.model';
import { CheckinLog } from '../models/checkinLog.model';

export const scanTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketCode } = req.body as { ticketCode?: string };
    const staffId = req.userId;

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

    if (ticket.status === 'checked-in') {
      await CheckinLog.create({
        ticketCode: ticket.ticketId,
        eventId: ticket.eventId,
        staffId,
        result: 'ALREADY_CHECKED_IN',
        reason: 'Vé đã được check-in trước đó',
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
    const checkedIn = await Ticket.countDocuments({ eventId, status: 'checked-in' });
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

