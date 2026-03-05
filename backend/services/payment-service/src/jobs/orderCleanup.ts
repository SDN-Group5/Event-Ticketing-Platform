import { Order } from '../models/order.model';
import { releaseSeatsForOrder } from '../services/seatRelease.service';
import PayOS from '@payos/node';

// Lấy bộ core client để huỷ payment link
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

// Kiểm tra nhanh có đủ key tạo client hay không (cho channel JSP/Default)
let payosClient: PayOS | null = null;
if (PAYOS_CLIENT_ID && PAYOS_API_KEY && PAYOS_CHECKSUM_KEY) {
    payosClient = new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
}

/**
 * Quét các Order Pending / Processing đã quá 5 phút.
 * Hủy PayOS Payment Link, đánh dấu về 'expired' và nhả ghế.
 */
export async function processExpiredOrders() {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Tìm các đơn còn đang treo/xử lý mà đã quá 5 phút chưa thanh toán
        const expiredOrders = await Order.find({
            status: { $in: ['pending', 'processing'] },
            createdAt: { $lt: fiveMinutesAgo }
        });

        if (expiredOrders.length === 0) return;

        console.log(`[Order Cleanup] Có ${expiredOrders.length} đơn hàng quá 5 phút cần huỷ...`);

        for (const order of expiredOrders) {
            try {
                // 1. Thử huỷ payment link trên PayOS (chỉ best-effort, vì webhook có thể đến trễ)
                if (order.payosPaymentLinkId && payosClient) {
                    try {
                        await payosClient.cancelPaymentLink(order.payosPaymentLinkId);
                    } catch (payosErr: any) {
                        console.warn(`[Order Cleanup] Không huỷ được PayOS link (có thể đã bị huỷ trước đó): ${payosErr?.message}`);
                    }
                }

                // 2. Chuyển trạng thái về expired (hay cancelled)
                order.status = 'expired';
                order.cancelledAt = new Date();
                await order.save();

                // 3. Nhả ghế bằng API bulk-release
                await releaseSeatsForOrder(order);

            } catch (err: any) {
                console.error(`[Order Cleanup] Lỗi khi xử lý đơn ${order.orderCode}: `, err?.message);
            }
        }

        console.log(`[Order Cleanup] Hoàn thành huỷ ${expiredOrders.length} đơn hàng.`);
    } catch (error) {
        console.error('[Order Cleanup] Lỗi catch ngoài:', error);
    }
}

/**
 * Hàm gọi để khởi động luồng vòng lặp dọn dẹp mỗi 20 giây.
 */
export function startOrderCleanupJob() {
    console.log('[Order Cleanup] Luồng dọn dẹp đơn hàng tự động đã bật (20 giây/chu kỳ).');
    setInterval(() => {
        processExpiredOrders();
    }, 20 * 1000);
}
