import axios from 'axios';

const SEAT_API_BASE_URL =
  process.env.SEAT_API_BASE_URL ||
  process.env.LAYOUT_SERVICE_URL ||
  'http://localhost:4002/api/v1';

/**
 * Đánh dấu các ghế trong order là đã bán (sold/blocked) trên seat/layout service.
 *
 * Dựa trên danh sách items trong order:
 * - eventId: order.eventId
 * - seatId: item.seatId (pattern giống FE đang dùng)
 *
 * Nếu service ghế chưa sẵn sàng hoặc lỗi → chỉ log warning, không throw
 * để không làm hỏng flow thanh toán.
 */
export async function markSeatsSoldForOrder(order: any): Promise<void> {
  try {
    if (!SEAT_API_BASE_URL) return;
    if (!order?.eventId || !Array.isArray(order.items)) return;

    const eventId = order.eventId;
    const baseUrl = SEAT_API_BASE_URL.replace(/\/$/, '');

    const seatIds: string[] = order.items
      .map((item: any) => item?.seatId)
      .filter((id: any) => typeof id === 'string' && id.length > 0);

    if (!seatIds.length) return;

    await Promise.all(
      seatIds.map(async (seatId) => {
        try {
          await axios.post(
            `${baseUrl}/events/${eventId}/seats/${seatId}/purchase`,
            {
              bookingId: String(order._id || order.orderCode || ''),
            },
          );
        } catch (err: any) {
          console.warn(
            '[markSeatsSoldForOrder] Không thể đánh dấu sold cho seat',
            seatId,
            '-',
            err?.response?.status,
            err?.response?.data || err?.message,
          );
        }
      }),
    );
  } catch (err: any) {
    console.warn('[markSeatsSoldForOrder] Lỗi chung:', err?.message || err);
  }
}

