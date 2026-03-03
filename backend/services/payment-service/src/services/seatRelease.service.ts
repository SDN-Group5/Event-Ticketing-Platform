import axios from 'axios';

const SEAT_API_BASE_URL =
  process.env.SEAT_API_BASE_URL ||
  process.env.LAYOUT_SERVICE_URL ||
  'http://localhost:4002/api/v1';

/**
 * Best-effort: gọi sang layout-service bulk-release để trả ghế về trạng thái trống.
 * Dùng route POST /events/:eventId/seats/bulk-release (không cần auth).
 * WebSocket broadcast sẽ tự động thông báo cho tất cả client.
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

    try {
      const resp = await axios.post(
        `${baseUrl}/events/${eventId}/seats/bulk-release`,
        { seatIds },
      );
      console.log(
        `[releaseSeatsForOrder] Released ${resp.data?.released || 0} seats for event ${eventId}`,
      );
    } catch (err: any) {
      console.warn(
        '[releaseSeatsForOrder] bulk-release failed:',
        err?.response?.status,
        err?.response?.data || err?.message,
      );
    }
  } catch (err: any) {
    console.warn('[releaseSeatsForOrder] Lỗi chung:', err?.message || err);
  }
}

