import { publishEvent } from '../config/rabbitmq';

/**
 * Publish event yeu cau layout-service tra ghe ve trang thai trong (available).
 * Thay vi goi HTTP truc tiep, gui message qua RabbitMQ.
 * Layout-service se subscribe va tu xu ly.
 */
export async function releaseSeatsForOrder(order: any): Promise<void> {
  try {
    if (!order?.eventId || !Array.isArray(order.items)) return;

    const eventId = order.eventId;
    const seatIds: string[] = order.items
      .map((item: any) => item?.seatId)
      .filter((id: any) => typeof id === 'string' && id.length > 0);

    if (!seatIds.length) return;

    const published = await publishEvent('seats.release', {
      eventId,
      seatIds,
      orderCode: order.orderCode,
    });

    if (!published) {
      console.warn('[releaseSeatsForOrder] RabbitMQ chua san sang, event khong duoc gui.');
    }
  } catch (err: any) {
    console.warn('[releaseSeatsForOrder] Loi:', err?.message || err);
  }
}
