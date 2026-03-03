import { Request, Response } from 'express';
import PayOS from '@payos/node';
import { Order } from '../models/order.model';
import { transferToOrganizerBank } from '../services/bankTransfer.service';

const COMMISSION_RATE = 0.05; // 5% hoa hồng mặc định cho app
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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

    const { eventId, eventName, organizerId, items, organizerBank, channel: rawChannel } = req.body;

    if (!eventId || !eventName || !organizerId || !items?.length) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng' });
    }

    const channel: PayOSChannel = rawChannel === 'mobile' ? 'mobile' : 'jsp';

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * (item.quantity || 1),
      0
    );

    const commissionAmount = Math.round(subtotal * COMMISSION_RATE);
    const organizerAmount = subtotal - commissionAmount;
    const totalAmount = subtotal;
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
      channel,
      status: 'pending',
    });

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
 * Lấy danh sách đơn hàng của user
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

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

        await runAutoPayout(order);
      }
    } else if (paymentInfo.status === 'CANCELLED') {
      order.status = 'cancelled';
      order.cancelledAt = new Date();
    } else if (paymentInfo.status === 'EXPIRED') {
      order.status = 'expired';
    }

    await order.save();
    console.log(`[webhook] Order ${orderCode} → ${order.status} | payoutStatus=${order.payoutStatus}`);

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

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    return res.json({ success: true, data: order });
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

    if (order.status === 'paid') {
      return res.json({ success: true, data: { status: 'paid', order } });
    }

    if (!order.payosPaymentLinkId) {
      return res.json({ success: true, data: { status: order.status, order } });
    }

    const payosClient = getPayOSClient((order as any).channel);
    const paymentInfo = await payosClient.getPaymentLinkInformation(order.payosPaymentLinkId);
    const currentStatus = order.status as string;

    if (paymentInfo.status === 'PAID' && currentStatus !== 'paid') {
      order.status = 'paid';
      order.paidAt = new Date();
      await runAutoPayout(order);
      await order.save();
    } else if (paymentInfo.status === 'CANCELLED' && currentStatus !== 'cancelled') {
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();
    }

    return res.json({
      success: true,
      data: {
        status: order.status,
        order,
        payosStatus: paymentInfo.status,
      },
    });
  } catch (err: any) {
    console.error('[verifyPayment] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
