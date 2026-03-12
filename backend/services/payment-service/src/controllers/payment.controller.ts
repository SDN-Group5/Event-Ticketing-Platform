import { Request, Response } from 'express';
import PayOS from '@payos/node';
import { Order } from '../models/order.model';
import { releaseSeatsForOrder } from '../services/seatRelease.service';
import { createBookingSaga, BookingContext } from '../saga/bookingSaga';
import { createPaymentCompleteSaga } from '../saga/paymentCompleteSaga';
import { createCancelSaga } from '../saga/cancelSaga';
import { createCancelVoucherSaga } from '../saga/cancelVoucherSaga';
import { SagaResult } from '../saga/sagaOrchestrator';

const COMMISSION_RATE = 0.05;
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
  try {
    const client = createPayOSInstance(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
    const data = client.verifyPaymentWebhookData(body);
    return { data, channel: 'jsp' };
  } catch (err) {
    // Try mobile keys
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
      // Both failed
    }
  }

  return null;
}

async function saveSagaLog(order: any, sagaName: string, result: SagaResult): Promise<void> {
  try {
    if (!order?._id) return;
    const logEntry = {
      sagaName,
      status: result.success ? 'completed' as const : 'compensated' as const,
      steps: result.stepLogs.map((s) => ({
        name: s.name,
        status: s.status,
        timestamp: s.timestamp,
        error: s.error,
      })),
    };
    await Order.updateOne(
      { _id: order._id },
      { $push: { sagaLog: logEntry } },
    );
  } catch (e: any) {
    console.warn('[saveSagaLog] Failed:', e?.message);
  }
}

// ==================== BOOKING (createPayment) ====================

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
    const payosClient = getPayOSClient(channel);

    const ctx: BookingContext = {
      userId,
      eventId,
      eventName,
      organizerId,
      organizerBank,
      items,
      channel,
      rawVoucherCode,
      frontendUrl: FRONTEND_URL,
      commissionRate: COMMISSION_RATE,
      payosClient,
    };

    const saga = createBookingSaga();
    const result = await saga.execute(ctx);

    if (result.context.order) {
      await saveSagaLog(result.context.order, 'BookingSaga', result);
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Lỗi tạo thanh toán',
        failedStep: result.failedStep,
      });
    }

    const { order, paymentLink } = result.context;
    return res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderCode: order.orderCode,
        subtotal: order.subtotal,
        voucherDiscount: order.voucherDiscount,
        voucherCode: order.voucherCode,
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

// ==================== GET ORDER ====================

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

// ==================== GET USER ORDERS ====================

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

// ==================== GET ORGANIZER ORDERS ====================

export const getOrganizerOrders = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).userId;
    if (!organizerId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const { page = 1, limit = 20, eventId, status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { organizerId };
    
    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;
    else filter.status = { $in: ['paid', 'refunded', 'pending', 'processing', 'cancelled', 'expired'] };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ paidAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error('[getOrganizerOrders] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== GET ORGANIZER CUSTOMERS ====================

export const getOrganizerCustomers = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).userId;
    if (!organizerId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const { page = 1, limit = 50, eventId } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Tìm tất cả đơn hàng của organizer (chỉ đơn đã thanh toán)
    let orderFilter: any = { organizerId, status: 'paid' };
    if (eventId) orderFilter.eventId = eventId;

    // Lấy tất cả đơn hàng
    const orders = await Order.find(orderFilter).lean();

    if (orders.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 },
      });
    }

    // Aggregate customer data từ orders
    const customerMap = new Map<string, any>();

    orders.forEach(order => {
      if (!customerMap.has(order.userId)) {
        customerMap.set(order.userId, {
          userId: order.userId,
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: null,
          events: new Set<string>(),
        });
      }
      const customer = customerMap.get(order.userId)!;
      customer.orderCount++;
      customer.totalSpent += order.totalAmount || 0;
      if (!customer.lastOrderDate || new Date(order.paidAt!) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = order.paidAt;
      }
      customer.events.add(order.eventName);
    });

    // Convert Map to array, map events Set to array, sort by lastOrderDate descending
    let customers = Array.from(customerMap.values())
      .map(c => ({
        ...c,
        events: Array.from(c.events),
      }))
      .sort((a, b) => {
        const dateA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
        const dateB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
        return dateB - dateA; // Newest first
      });

    // Lấy total trước khi paginate
    const total = customers.length;
    const totalPages = Math.ceil(total / limitNum);

    // Áp dụng pagination
    const paginatedCustomers = customers.slice(skip, skip + limitNum);

    return res.json({
      success: true,
      data: paginatedCustomers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error('[getOrganizerCustomers] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== WEBHOOK ====================

async function handlePaidOrder(order: any): Promise<void> {
  if (order.status === 'paid') return;

  const saga = createPaymentCompleteSaga();
  const result = await saga.execute({ order });
  await saveSagaLog(order, 'PaymentCompleteSaga', result);

  if (!result.success) {
    console.error(`[handlePaidOrder] Saga failed at step: ${result.failedStep} - ${result.error}`);
  }
}

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
      await handlePaidOrder(order);
      console.log(`[webhook] Order ${orderCode} → paid | payoutStatus=${order.payoutStatus}`);
    } else if (paymentInfo.status === 'CANCELLED' || paymentInfo.status === 'EXPIRED') {
      const cancelSaga = createCancelSaga();
      const cancelResult = await cancelSaga.execute({ order });
      await saveSagaLog(order, 'CancelSaga:webhook', cancelResult);
      console.log(
        `[webhook] Order ${orderCode} bị ${paymentInfo.status}, đã xoá khỏi database theo yêu cầu business.`,
      );
    } else {
      console.log(
        `[webhook] Order ${orderCode} nhận trạng thái PayOS=${paymentInfo.status}, không thay đổi dữ liệu.`,
      );
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('[webhook] Error:', err);
    return res.json({ success: true });
  }
};

// ==================== CANCEL PAYMENT ====================

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

    const payosClient = getPayOSClient((order as any).channel);
    const saga = createCancelSaga();
    const result = await saga.execute({ order, payosClient });

    await saveSagaLog(order, 'CancelSaga', result);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Lỗi huỷ đơn',
        failedStep: result.failedStep,
      });
    }

    return res.json({ success: true, data: null, message: 'Đơn hàng đã được huỷ và xoá khỏi hệ thống' });
  } catch (err: any) {
    console.error('[cancelPayment] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== VERIFY PAYMENT ====================

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode: Number(orderCode) });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (!order.payosPaymentLinkId) {
      return res.json({
        success: true,
        data: { status: order.status, order, payosStatus: 'UNKNOWN' },
      });
    }

    const payosClient = getPayOSClient((order as any).channel);
    const paymentInfo = await payosClient.getPaymentLinkInformation(order.payosPaymentLinkId);
    const currentStatus = order.status as string;

    if (paymentInfo.status === 'PAID' && currentStatus !== 'paid') {
      await handlePaidOrder(order);

      return res.json({
        success: true,
        data: { status: 'paid', order, payosStatus: paymentInfo.status },
      });
    }

    if (paymentInfo.status === 'CANCELLED' || paymentInfo.status === 'EXPIRED') {
      await releaseSeatsForOrder(order);
      await Order.deleteOne({ _id: order._id });

      return res.json({
        success: true,
        data: { status: 'deleted', order: null, payosStatus: paymentInfo.status },
      });
    }

    return res.json({
      success: true,
      data: { status: currentStatus, order, payosStatus: paymentInfo.status },
    });
  } catch (err: any) {
    console.error('[verifyPayment] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== CANCEL PAID ORDER WITH VOUCHER ====================

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
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền huỷ đơn hàng này' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể huỷ các đơn đã thanh toán (paid)',
      });
    }

    const totalAmount = Number(order.totalAmount || 0);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Đơn hàng không hợp lệ để cấp voucher' });
    }

    const voucherValue = Math.floor(totalAmount * 0.5);
    if (voucherValue <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền đơn hàng quá nhỏ, không thể cấp voucher' });
    }

    const saga = createCancelVoucherSaga();
    const result = await saga.execute({ order, voucherValue });

    await saveSagaLog(order, 'CancelVoucherSaga', result);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Lỗi huỷ đơn + cấp voucher',
        failedStep: result.failedStep,
      });
    }

    return res.json({
      success: true,
      data: {
        orderCode: order.orderCode,
        status: order.status,
        voucher: result.context.voucher,
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
