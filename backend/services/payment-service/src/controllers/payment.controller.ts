import { Request, Response } from 'express';
import PayOS from '@payos/node';
import axios from 'axios';
import { Order } from '../models/order.model';
import { Voucher } from '../models/voucher.model';
import { transferToOrganizerBank } from '../services/bankTransfer.service';
import { releaseSeatsForOrder } from '../services/seatRelease.service';

const COMMISSION_RATE = 0.05; // 5% hoa hồng mặc định cho app
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const LAYOUT_SERVICE_URL = process.env.LAYOUT_SERVICE_URL || 'http://localhost:4002';

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

const PAYOS_MOBILE_CLIENT_ID = process.env.PAYOS_MOBILE_CLIENT_ID;
const PAYOS_MOBILE_API_KEY = process.env.PAYOS_MOBILE_API_KEY;
const PAYOS_MOBILE_CHECKSUM_KEY = process.env.PAYOS_MOBILE_CHECKSUM_KEY;

type PayOSChannel = 'jsp' | 'mobile';

function createPayOSInstance(clientId?: string, apiKey?: string, checksumKey?: string) {
  if (!clientId || !apiKey || !checksumKey) {
    throw new Error('Chưa cấu hình đầy đủ thông tin PayOS (clientId/apiKey/checksumKey)');
  }

  return new PayOS(clientId, apiKey, checksumKey);
}

function getPayOSClient(channel?: string) {
  const normalized = channel === 'mobile' ? 'mobile' : 'jsp';

  if (normalized === 'mobile') {
    if (PAYOS_MOBILE_CLIENT_ID && PAYOS_MOBILE_API_KEY && PAYOS_MOBILE_CHECKSUM_KEY) {
      return createPayOSInstance(PAYOS_MOBILE_CLIENT_ID, PAYOS_MOBILE_API_KEY, PAYOS_MOBILE_CHECKSUM_KEY);
    }

    console.warn('[PayOS] PAYOS_MOBILE_* chưa cấu hình, fallback sang PAYOS_* (JSP/SERVLET)');
  }

  return createPayOSInstance(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
}

function verifyWebhookWithMultipleKeys(body: any): { data: any; channel: PayOSChannel } | null {
  // Thử verify bằng tài khoản JSP/SERVLET (mặc định)
  try {
    const client = createPayOSInstance(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
    const data = client.verifyPaymentWebhookData(body);
    return { data, channel: 'jsp' };
  } catch (err) {
    // Bỏ qua, thử với tài khoản Mobile
  }

  if (PAYOS_MOBILE_CLIENT_ID && PAYOS_MOBILE_API_KEY && PAYOS_MOBILE_CHECKSUM_KEY) {
    try {
      const client = createPayOSInstance(
        PAYOS_MOBILE_CLIENT_ID,
        PAYOS_MOBILE_API_KEY,
        PAYOS_MOBILE_CHECKSUM_KEY,
      );
      const data = client.verifyPaymentWebhookData(body);
      return { data, channel: 'mobile' };
    } catch (err) {
      // Không verify được với cả 2 bộ key
    }
  }

  return null;
}

/**
 * Tạo orderCode unique dựa trên timestamp + random
 * PayOS yêu cầu orderCode là số nguyên dương, tối đa 9007199254740991
 */
function generateOrderCode(): number {
  const timestamp = Date.now() % 1_000_000_000;
  const random = Math.floor(Math.random() * 1000);
  return timestamp * 1000 + random;
}

async function markSeatsSold(order: any): Promise<void> {
  if (!order.items || order.items.length === 0) return;
  const seatIds = order.items
    .filter((item: any) => item.seatId)
    .map((item: any) => item.seatId);
  if (seatIds.length === 0) return;
  try {
    const url = `${LAYOUT_SERVICE_URL}/api/v1/events/${order.eventId}/seats/bulk-sold`;
    await axios.post(url, {
      seatIds,
      userId: order.userId,
      bookingId: String(order.orderCode),
    }, { timeout: 5000 });
    console.log(`[markSeatsSold] Marked ${seatIds.length} seats as sold for order ${order.orderCode}`);
  } catch (err: any) {
    // Non-fatal: log and continue. Seats may not exist yet if not generated.
    console.warn(`[markSeatsSold] Could not update seat status:`, err?.message || err);
  }
}

async function runAutoPayout(order: any): Promise<void> {
  if (!order.organizerAmount || order.organizerAmount <= 0) {
    order.payoutStatus = 'skipped';
    return;
  }

  const bank = order.organizerBank;

  if (!bank || !bank.bankAccountNumber || !bank.bankAccountName) {
    order.payoutStatus = 'skipped';
    return;
  }

  // Nếu chưa cấu hình BANK_API_BASE_URL thì không cố gọi sang ngân hàng
  if (!process.env.BANK_API_BASE_URL) {
    console.warn(
      `[autoPayout] BANK_API_BASE_URL chưa cấu hình. Bỏ qua auto payout cho order ${order.orderCode}.`,
    );
    order.payoutStatus = 'skipped';
    return;
  }

  try {
    const result = await transferToOrganizerBank({
      toAccountNumber: bank.bankAccountNumber,
      toAccountName: bank.bankAccountName,
      bankCode: bank.bankCode,
      bankName: bank.bankName,
      amount: order.organizerAmount,
      description: `Payout cho organizer ${order.organizerId} - order ${order.orderCode}`,
    });

    order.payoutStatus = 'success';
    order.payoutTxnId = result.transactionId;
    order.payoutAt = new Date();
    order.payoutError = undefined;
  } catch (err: any) {
    console.error('[autoPayout] Error:', err?.message || err);
    order.payoutStatus = 'failed';
    order.payoutError = err?.message || 'Payout failed';
  }
}

/**
 * POST /api/payments/create
 * Tạo đơn hàng + tạo payment link PayOS → trả về QR + checkout URL
 *
 * Body: { eventId, eventName, organizerId, items: [{ zoneName, seatId?, price, quantity }], organizerBank? }
 * Header: x-user-id (truyền từ api-gateway sau khi verify token)
 */
export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Thiếu userId - hãy đăng nhập' });
    }

    const {
      eventId,
      eventName,
      organizerId,
      items,
      organizerBank,
      channel: rawChannel,
      voucherCode: rawVoucherCode,
    } = req.body;

    if (!eventId || !eventName || !organizerId || !items?.length) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng' });
    }

    const channel: PayOSChannel = rawChannel === 'mobile' ? 'mobile' : 'jsp';

    // Business rule: không giữ lại các đơn chưa thanh toán.
    // Trước khi tạo order mới, xoá tất cả order cũ của user chưa paid (pending/processing/expired/cancelled...).
    const oldOrders = await Order.find({ userId, status: { $ne: 'paid' } });
    // Best-effort: trả ghế về trống trước khi xoá order cũ (tránh kẹt ghế)
    await Promise.all(oldOrders.map((o) => releaseSeatsForOrder(o)));
    await Order.deleteMany({ userId, status: { $ne: 'paid' } });

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * (item.quantity || 1),
      0
    );

    // ================== ÁP DỤNG VOUCHER (NẾU CÓ) ==================
    let totalAmount = subtotal;
    let voucherDiscount = 0;
    let voucherCode: string | undefined;
    let voucherId: string | undefined;

    if (rawVoucherCode) {
      const normalizedCode = String(rawVoucherCode).trim().toUpperCase();
      const now = new Date();

      const voucher = await Voucher.findOne({
        code: normalizedCode,
        status: 'active',
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: now } },
        ],
      });

      if (!voucher) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher không hợp lệ hoặc không tồn tại',
        });
      }

      if (voucher.endDate && voucher.endDate < now) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher đã hết hạn',
        });
      }

      if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher đã được sử dụng tối đa số lần cho phép',
        });
      }

      if (voucher.minimumPrice && subtotal < voucher.minimumPrice) {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng phải tối thiểu ${voucher.minimumPrice} để dùng mã này`,
        });
      }

      // Nếu voucher gắn với 1 event cụ thể thì enforce
      if (voucher.eventId && voucher.eventId !== eventId) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher không áp dụng cho sự kiện này',
        });
      }

      // Nếu voucher cá nhân hoá cho 1 user
      if (voucher.userId && voucher.userId !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher này chỉ áp dụng cho tài khoản đã được cấp',
        });
      }

      // Tính số tiền được giảm
      if (voucher.discountType === 'percentage') {
        voucherDiscount = Math.floor(
          (subtotal * Number(voucher.discountValue || 0)) / 100,
        );
      } else {
        voucherDiscount = Number(voucher.discountValue || 0);
      }

      if (voucherDiscount < 0) voucherDiscount = 0;
      if (voucherDiscount > subtotal) voucherDiscount = subtotal;

      totalAmount = subtotal - voucherDiscount;
      voucherCode = normalizedCode;
      voucherId = voucher._id.toString();

      // Tăng đếm dùng voucher (optimistic, không quá quan trọng tính chính xác 100%)
      voucher.usedCount += 1;
      await voucher.save();
    }

    const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);
    const organizerAmount = totalAmount - commissionAmount;
    const orderCode = generateOrderCode();

    const order = await Order.create({
      orderCode,
      userId,
      eventId,
      eventName,
      organizerId,
      organizerBank,
      items,
      subtotal,
      commissionRate: COMMISSION_RATE,
      commissionAmount,
      organizerAmount,
      totalAmount,
      voucherCode,
      voucherDiscount,
      voucherId,
      channel,
      status: 'pending',
    });

    // ================== LOCK GHẾ (RESERVE) ==================
    // Gọi sang layout-service để lock ghế ngay khi tạo order thành công.
    // Nếu đơn hàng có seatId, ta phải đảm bảo ghế đó được giữ (reserved).
    const seatIds = items
      .filter((item: any) => item.seatId)
      .map((item: any) => item.seatId);

    if (seatIds.length > 0) {
      try {
        const reserveUrl = `${LAYOUT_SERVICE_URL}/api/v1/events/${eventId}/seats/bulk-reserve`;
        const reserveResp = await axios.post(reserveUrl, {
          seatIds,
          userId
        }, { timeout: 5000 });

        const reservedCount = reserveResp.data?.reserved || 0;
        
        if (reservedCount < seatIds.length) {
          // KHÔNG LOCK ĐƯỢC ĐỦ GHẾ -> Phải rollback
          console.warn(`[createPayment] Only locked ${reservedCount}/${seatIds.length} seats. Rolling back.`);
          
          // Release những ghế vừa trót lock (nếu có)
          if (reservedCount > 0) {
            const releaseUrl = `${LAYOUT_SERVICE_URL}/api/v1/events/${eventId}/seats/bulk-release`;
            await axios.post(releaseUrl, { seatIds }).catch(e => console.error('[createPayment] Rollback release failed:', e.message));
          }

          // Xoá order vừa tạo
          await Order.deleteOne({ _id: order._id });
          
          return res.status(400).json({ 
            success: false, 
            message: 'Một số ghế bạn chọn đã có người khác đặt nhanh hơn. Vui lòng quay lại chọn ghế khác.' 
          });
        }
        
        console.log(`[createPayment] Successfully locked all ${reservedCount} seats for order ${orderCode}`);
      } catch (err: any) {
        console.error('[createPayment] Seat locking failed:', err?.message);
        // Nếu lỗi hệ thống (timeout, 500...), tạm thời xoá order để an toàn
        await Order.deleteOne({ _id: order._id });
        return res.status(500).json({ success: false, message: 'Lỗi khi giữ chỗ. Vui lòng thử lại sau.' });
      }
    }

    const payosItems = items.map((item: any) => ({
      name: `${eventName} - ${item.zoneName}`,
      quantity: item.quantity || 1,
      price: item.price,
    }));

    const paymentData = {
      orderCode,
      amount: totalAmount,
      description: `Vé ${eventName}`.substring(0, 25),
      items: payosItems,
      returnUrl: `${FRONTEND_URL}/payment-success?orderCode=${orderCode}`,
      cancelUrl: `${FRONTEND_URL}/payment-cancel?orderCode=${orderCode}`,
    };

    const payosClient = getPayOSClient(channel);
    const paymentLink = await payosClient.createPaymentLink(paymentData);

    order.payosPaymentLinkId = paymentLink.paymentLinkId;
    order.payosCheckoutUrl = paymentLink.checkoutUrl;
    order.qrCode = paymentLink.qrCode;
    order.status = 'processing';
    await order.save();

    return res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
        commissionAmount: order.commissionAmount,
        organizerAmount: order.organizerAmount,
        checkoutUrl: paymentLink.checkoutUrl,
        qrCode: paymentLink.qrCode,
        paymentLinkId: paymentLink.paymentLinkId,
      },
    });
  } catch (err: any) {
    console.error('[createPayment] Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Lỗi tạo thanh toán' });
  }
};

/**
 * GET /api/payments/order/:orderCode
 * Lấy thông tin đơn hàng theo orderCode
 */
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode: Number(orderCode) });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    return res.json({ success: true, data: order });
  } catch (err: any) {
    console.error('[getOrder] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/payments/user/:userId
 * Lấy danh sách đơn hàng của user.
 * Nghiệp vụ: chỉ lưu/trả về payment trạng thái đã thanh toán (paid) hoặc đã hoàn tiền (refunded).
 * Đơn pending/processing/cancelled/expired không đưa vào lịch sử (TTL hoặc webhook/verify sẽ xoá).
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({
      userId,
      status: { $in: ['paid', 'refunded', 'cancelled', 'expired', 'pending', 'processing'] },
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (err: any) {
    console.error('[getUserOrders] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/payments/webhook
 * PayOS gọi về khi trạng thái thanh toán thay đổi
 * PayOS gửi body: { code, desc, data: { orderCode, amount, ... }, signature }
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const verified = verifyWebhookWithMultipleKeys(req.body);

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { data: webhookData, channel } = verified as any;
    const { orderCode } = webhookData as any;
    const order = await Order.findOne({ orderCode });

    if (!order) {
      console.warn(`[webhook] orderCode ${orderCode} không tìm thấy`);
      return res.json({ success: true });
    }

    const orderChannel = (order as any).channel || channel;
    if (!order.channel) {
      (order as any).channel = orderChannel;
    }

    const payosClient = getPayOSClient(orderChannel);
    const paymentInfo = await payosClient.getPaymentLinkInformation(order.payosPaymentLinkId!);

    if (paymentInfo.status === 'PAID') {
      if (order.status !== 'paid') {
        order.status = 'paid';
        order.paidAt = new Date();

        // Quan trọng: đánh dấu ghế đã bán trên layout-service để chặn người khác đặt lại
        await markSeatsSold(order);
        await runAutoPayout(order);
        await order.save();
      }
      console.log(`[webhook] Order ${orderCode} → paid | payoutStatus=${order.payoutStatus}`);
    } else if (paymentInfo.status === 'CANCELLED' || paymentInfo.status === 'EXPIRED') {
      // Yêu cầu business: không lưu các order bị huỷ / hết hạn
      await releaseSeatsForOrder(order);
      await Order.deleteOne({ _id: order._id });
      console.log(
        `[webhook] Order ${orderCode} bị ${paymentInfo.status}, đã xoá khỏi database theo yêu cầu business.`
      );
    } else {
      console.log(
        `[webhook] Order ${orderCode} nhận trạng thái PayOS=${paymentInfo.status}, không thay đổi dữ liệu.`
      );
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('[webhook] Error:', err);
    return res.json({ success: true });
  }
};

/**
 * POST /api/payments/cancel/:orderCode
 * Huỷ đơn hàng + huỷ payment link
 */
export const cancelPayment = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode: Number(orderCode) });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Đơn đã thanh toán, không thể huỷ' });
    }

    if (order.payosPaymentLinkId) {
      try {
        const payosClient = getPayOSClient((order as any).channel);
        await payosClient.cancelPaymentLink(order.payosPaymentLinkId);
      } catch (e) {
        console.warn('[cancelPayment] PayOS cancel failed:', e);
      }
    }

    // Yêu cầu business: khi user huỷ thanh toán thì xoá luôn order
    // và trả ghế về trạng thái trống (nếu có)
    await releaseSeatsForOrder(order);
    await Order.deleteOne({ _id: order._id });

    return res.json({ success: true, data: null, message: 'Đơn hàng đã được huỷ và xoá khỏi hệ thống' });
  } catch (err: any) {
    console.error('[cancelPayment] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/payments/verify/:orderCode
 * Kiểm tra trạng thái thanh toán realtime từ PayOS
 * (Frontend gọi sau khi return từ PayOS)
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode: Number(orderCode) });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (!order.payosPaymentLinkId) {
      // Nếu không có paymentLinkId thì coi như order này không hợp lệ
      return res.json({
        success: true,
        data: {
          status: order.status,
          order,
          payosStatus: 'UNKNOWN',
        },
      });
    }

    const payosClient = getPayOSClient((order as any).channel);
    const paymentInfo = await payosClient.getPaymentLinkInformation(order.payosPaymentLinkId);
    const currentStatus = order.status as string;

    if (paymentInfo.status === 'PAID' && currentStatus !== 'paid') {
      order.status = 'paid';
      order.paidAt = new Date();
      // Quan trọng: đánh dấu ghế đã bán trên layout-service để chặn người khác đặt lại
      await markSeatsSold(order);
      await runAutoPayout(order);
      await order.save();

      return res.json({
        success: true,
        data: {
          status: 'paid',
          order,
          payosStatus: paymentInfo.status,
        },
      });
    }

    if (paymentInfo.status === 'CANCELLED' || paymentInfo.status === 'EXPIRED') {
      await releaseSeatsForOrder(order);
      await Order.deleteOne({ _id: order._id });

      return res.json({
        success: true,
        data: {
          status: 'deleted',
          order: null,
          payosStatus: paymentInfo.status,
        },
      });
    }

    // Các trạng thái khác: trả về hiện trạng, không chỉnh sửa DB
    return res.json({
      success: true,
      data: {
        status: currentStatus,
        order,
        payosStatus: paymentInfo.status,
      },
    });
  } catch (err: any) {
    console.error('[verifyPayment] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/payments/cancel-with-voucher/:orderCode
 * Huỷ vé đã thanh toán theo dạng "không hoàn tiền" nhưng cấp voucher 50% giá trị đơn
 * + cố gắng trả ghế về trạng thái trống ở seat service.
 *
 * Yêu cầu:
 * - order.status phải là 'paid'
 * - userId trong header/body phải trùng với order.userId
 */
export const cancelPaidOrderWithVoucher = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.params;
    const userId =
      (req.headers['x-user-id'] as string) ||
      (req.body && (req.body.userId as string));

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'Thiếu userId (header x-user-id hoặc body.userId)' });
    }

    const order = await Order.findOne({ orderCode: Number(orderCode) });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.userId !== userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Bạn không có quyền huỷ đơn hàng này' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể huỷ các đơn đã thanh toán (paid)',
      });
    }

    const totalAmount = Number(order.totalAmount || 0);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không hợp lệ để cấp voucher',
      });
    }

    // Tính giá trị voucher = 50% giá trị đơn
    const voucherValue = Math.floor(totalAmount * 0.5);
    if (voucherValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền đơn hàng quá nhỏ, không thể cấp voucher',
      });
    }

    // Tạo code voucher tương đối unique
    const baseCode = `CANCEL-${order.orderCode}`;
    let code = baseCode;
    let suffix = 0;
    // Tránh trùng code nếu user huỷ nhiều lần (hoặc retry)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await Voucher.findOne({ code });
      if (!exists) break;
      suffix += 1;
      code = `${baseCode}-${suffix}`;
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 ngày

    const voucher = await Voucher.create({
      code,
      description: `Voucher 50% giá trị đơn ${order.orderCode}`,
      discountType: 'fixed',
      discountValue: voucherValue,
      maxUses: 1,
      usedCount: 0,
      startDate: now,
      endDate,
      minimumPrice: undefined,
      status: 'active',
      organizerId: order.organizerId,
      eventId: order.eventId,
      userId: order.userId,
    });

    // Cập nhật order:
    // - đánh dấu là "refunded" (để FE hiện là đã xử lý)
    // - lưu lại thông tin voucher đã cấp
    order.status = 'refunded';
    order.cancelledAt = new Date();
    (order as any).voucherCode = voucher.code;
    (order as any).voucherDiscount = voucher.discountValue;
    (order as any).voucherId = voucher._id.toString();
    await order.save();

    // Best-effort: gọi sang seat service để trả ghế về trạng thái trống
    await releaseSeatsForOrder(order);

    return res.json({
      success: true,
      data: {
        orderCode: order.orderCode,
        status: order.status,
        voucher,
      },
      message:
        'Đơn hàng đã được huỷ theo chính sách voucher. Đã cấp voucher 50% giá trị đơn và trả ghế về trống (nếu có).',
    });
  } catch (err: any) {
    console.error('[cancelPaidOrderWithVoucher] Error:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Lỗi huỷ đơn + cấp voucher',
    });
  }
};
