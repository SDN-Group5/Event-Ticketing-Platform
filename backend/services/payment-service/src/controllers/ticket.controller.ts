import { Request, Response } from 'express';
import { Ticket } from '../models/ticket.model';

export const getPublicTicketByTicketId = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return res.status(400).json({ success: false, message: 'Thiếu ticketId' });
    }

    const ticket = await Ticket.findOne({ ticketId }).lean();
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vé' });
    }

    // Public response: chỉ trả dữ liệu cần để render + QR payload
    return res.json({
      success: true,
      data: {
        ticketId: ticket.ticketId,
        orderCode: ticket.orderCode,
        eventId: ticket.eventId,
        eventName: ticket.eventName,
        zoneName: ticket.zoneName,
        seatLabel: ticket.seatLabel,
        price: ticket.price,
        status: ticket.status,
        qrCodePayload: ticket.qrCodePayload,
      },
    });
  } catch (err: any) {
    console.error('[getPublicTicketByTicketId] Error:', err?.message);
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

