import { publishEvent } from '../config/rabbitmq';

/**
 * Publish event yeu cau layout-service danh dau ghe da ban (sold).
 * Thay vi goi HTTP truc tiep, gui message qua RabbitMQ.
 * Layout-service se subscribe va tu xu ly.
 */
export async function markSeatsSoldForOrder(order: any): Promise<void> {
  try {
    if (!order?.eventId || !Array.isArray(order.items)) return;

    const eventId = order.eventId;
    const seatIds: string[] = order.items
      .map((item: any) => item?.seatId)
      .filter((id: any) => typeof id === 'string' && id.length > 0);

    if (!seatIds.length) return;

    const published = await publishEvent('seats.mark_sold', {
      eventId,
      seatIds,
      bookingId: String(order._id || order.orderCode || ''),
      orderCode: order.orderCode,
    });

    if (!published) {
      console.warn('[markSeatsSoldForOrder] RabbitMQ chua san sang, event khong duoc gui.');
    }
  } catch (err: any) {
    console.warn('[markSeatsSoldForOrder] Loi:', err?.message || err);
  }
}
