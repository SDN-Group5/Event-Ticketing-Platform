import { Ticket, ITicket } from '../models/ticket.model';

export interface TicketData {
  ticketId: string;
  orderCode: number;
  eventName: string;
  zoneName: string;
  seatLabel?: string;
  qrCodePayload: string; // Client sẽ tự render QR từ payload
}

/**
 * Create tickets for an order
 * Generate QR code for each ticket and save to database
 */
export const createTicketsForOrder = async (
  orderId: string,
  orderCode: number,
  userId: string,
  eventId: string,
  eventName: string,
  items: Array<{
    zoneName: string;
    seatId?: string;
    price: number;
    quantity: number;
  }>
): Promise<TicketData[]> => {
  try {
    const tickets: TicketData[] = [];
    const ticketDocuments: ITicket[] = [];

    let itemIndex = 0;

    for (const item of items) {
      // Create one ticket per quantity
      for (let i = 0; i < item.quantity; i++) {
        itemIndex++;

        // Mã vé ngắn gọn hơn trên URL: TV-{orderCode base36}-{số thứ tự vé trong đơn}
        const orderSlug = orderCode.toString(36);
        const ticketId = `TV-${orderSlug}-${itemIndex}`;

        // Create QR code payload (contains essential ticket info)
        const qrPayload = JSON.stringify({
          ticketId,
          eventName,
          eventId,
          zoneName: item.zoneName,
          userId,
          orderCode,
        });

        // Create ticket document for database
        const ticketDoc: ITicket = new Ticket({
          ticketId,
          orderId: orderId.toString(),
          orderCode,
          userId,
          eventId,
          eventName,
          zoneName: item.zoneName,
          seatId: item.seatId,
          seatLabel: item.seatId ? `${item.zoneName}-${i + 1}` : undefined,
          price: item.price,
          qrCodePayload: qrPayload,
          status: 'issued',
        });

        ticketDocuments.push(ticketDoc);

        // Add to response with Buffer
        tickets.push({
          ticketId,
          orderCode,
          eventName,
          zoneName: item.zoneName,
          seatLabel: item.seatId ? `${item.zoneName}-${i + 1}` : undefined,
          qrCodePayload: qrPayload, // cái ni dùng để render QR code trong mobile
        });
      }
    }

    // Bulk insert all tickets
    if (ticketDocuments.length > 0) {
      await Ticket.insertMany(ticketDocuments);
      console.log(
        `✅ [Ticket Service] Created ${ticketDocuments.length} tickets for order ${orderCode}`
      );
    }

    return tickets;
  } catch (err: any) {
    console.error('[Ticket Service] Error creating tickets:', err?.message);
    throw err;
  }
};

/**
 * Get tickets for an order (for viewing/scanning)
 */
export const getTicketsByOrderId = async (orderId: string): Promise<ITicket[]> => {
  try {
    return await Ticket.find({ orderId });
  } catch (err: any) {
    console.error('[Ticket Service] Error fetching tickets:', err?.message);
    return [];
  }
};

/**
 * Get active tickets for a user
 */
export const getUserActiveTickets = async (userId: string): Promise<ITicket[]> => {
  try {
    return await Ticket.find({
      userId,
      status: { $in: ['issued', 'checked-in'] },
    });
  } catch (err: any) {
    console.error('[Ticket Service] Error fetching user tickets:', err?.message);
    return [];
  }
};
