import QRCode from 'qrcode';
import { Ticket, ITicket } from '../models/ticket.model';

export interface TicketData {
  ticketId: string;
  orderCode: number;
  eventName: string;
  zoneName: string;
  seatLabel?: string;
  qrCodeBuffer: Buffer; // Buffer for email attachment
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

        // Generate unique ticket ID
        const ticketId = `TV-${orderCode}-${itemIndex}`;

        // Create QR code payload (contains essential ticket info)
        const qrPayload = JSON.stringify({
          ticketId,
          eventName,
          eventId,
          zoneName: item.zoneName,
          userId,
          orderCode,
        });

        // Generate QR code as PNG Buffer (for email attachment)
        const qrCodeBuffer = ( await QRCode.toBuffer(qrPayload, {
          errorCorrectionLevel: 'H',
          type: 'png',
          margin: 1,
          width: 200,
        })) as Buffer;

        // Also store as data URL for database
        const qrCodeImage = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          margin: 1,
          width: 200,
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
          qrCodeImage, // Store base64 for quick access
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
          qrCodeBuffer, // Buffer for email attachment
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
