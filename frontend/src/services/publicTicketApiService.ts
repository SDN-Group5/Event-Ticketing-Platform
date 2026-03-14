import axios from 'axios';

const API_BASE =
  (import.meta as any).env.VITE_API_URL ||
  'https://ticket-platform.up.railway.app';

export type PublicTicket = {
  ticketId: string;
  orderCode: number;
  eventId: string;
  eventName: string;
  zoneName: string;
  seatLabel?: string;
  price: number;
  status: string;
  qrCodePayload: string;
};

export const publicTicketApiService = {
  async getTicketById(ticketId: string): Promise<PublicTicket> {
    const res = await axios.get(
      `${API_BASE}/api/payments/tickets/public/${encodeURIComponent(ticketId)}`
    );
    const data: PublicTicket | null = res.data?.data ?? null;
    if (!data) throw new Error('Không tìm thấy vé');
    return data;
  },
};
