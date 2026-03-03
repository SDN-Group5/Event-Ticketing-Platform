import axios from 'axios';

const SEAT_API_BASE_URL =
  process.env.SEAT_API_BASE_URL ||
  process.env.LAYOUT_SERVICE_URL ||
  'http://localhost:4002/api/v1';

/**
 * Best-effort: gọi sang seat/layout service để trả ghế về trạng thái trống
 * dựa trên danh sách seatId trong order.items.
 *
 * Nếu service ghế chưa sẵn sàng hoặc lỗi → chỉ log warning, không throw.
 */
export async function releaseSeatsForOrder(order: any): Promise<void> {
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
          // Theo FE seatApiService: DELETE /events/:eventId/seats/:seatId/reservation
          await axios.delete(
            `${baseUrl}/events/${eventId}/seats/${seatId}/reservation`,
          );
        } catch (err: any) {
          console.warn(
            '[releaseSeatsForOrder] Không thể trả ghế về trống',
            seatId,
            '-',
            err?.response?.status,
            err?.response?.data || err?.message,
          );
        }
      }),
    );
  } catch (err: any) {
    console.warn('[releaseSeatsForOrder] Lỗi chung:', err?.message || err);
  }
}

