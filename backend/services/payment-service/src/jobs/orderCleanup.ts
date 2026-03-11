import { Order } from '../models/order.model';
import { createCancelSaga } from '../saga/cancelSaga';
import PayOS from '@payos/node';

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

let payosClient: PayOS | null = null;
if (PAYOS_CLIENT_ID && PAYOS_API_KEY && PAYOS_CHECKSUM_KEY) {
  payosClient = new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
}

/**
 * Quét các Order Pending / Processing đã quá 5 phút.
 * Dùng CancelSaga để huỷ PayOS link, nhả ghế, và xoá order.
 */
export async function processExpiredOrders() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const expiredOrders = await Order.find({
      status: { $in: ['pending', 'processing'] },
      createdAt: { $lt: fiveMinutesAgo },
    });

    if (expiredOrders.length === 0) return;

    console.log(`[Order Cleanup] Có ${expiredOrders.length} đơn hàng quá 5 phút cần huỷ...`);

    for (const order of expiredOrders) {
      try {
        const saga = createCancelSaga();
        const result = await saga.execute({
          order,
          payosClient: payosClient || undefined,
        });

        if (!result.success) {
          console.warn(`[Order Cleanup] Saga failed cho order ${order.orderCode}: ${result.error}`);
        }
      } catch (err: any) {
        console.error(`[Order Cleanup] Lỗi khi xử lý đơn ${order.orderCode}: `, err?.message);
      }
    }

    console.log(`[Order Cleanup] Hoàn thành huỷ ${expiredOrders.length} đơn hàng.`);
  } catch (error) {
    console.error('[Order Cleanup] Lỗi catch ngoài:', error);
  }
}

export function startOrderCleanupJob() {
  console.log('[Order Cleanup] Luồng dọn dẹp đơn hàng tự động đã bật (20 giây/chu kỳ).');
  setInterval(() => {
    processExpiredOrders();
  }, 20 * 1000);
}
