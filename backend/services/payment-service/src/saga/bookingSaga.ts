import { SagaOrchestrator, SagaStep } from './sagaOrchestrator';
import { Order } from '../models/order.model';
import { Voucher } from '../models/voucher.model';
import { releaseSeatsForOrder } from '../services/seatRelease.service';
import PayOS from '@payos/node';

export interface BookingContext {
  userId: string;
  eventId: string;
  eventName: string;
  organizerId: string;
  organizerBank?: any;
  items: any[];
  channel: 'jsp' | 'mobile';
  rawVoucherCode?: string;
  frontendUrl: string;
  commissionRate: number;

  // Populated by steps
  voucherTicketCount?: number;
  subtotal?: number;
  totalAmount?: number;
  voucherDiscount?: number;
  voucherCode?: string;
  voucherId?: string;
  voucherDoc?: any;
  commissionAmount?: number;
  organizerAmount?: number;
  orderCode?: number;
  order?: any;
  payosClient?: PayOS;
  paymentLink?: any;
}

const cleanupStep: SagaStep<BookingContext> = {
  name: 'cleanup-old-orders',
  async execute(ctx) {
    const oldOrders = await Order.find({ userId: ctx.userId, status: { $ne: 'paid' } });
    await Promise.all(oldOrders.map((o) => releaseSeatsForOrder(o)));
    await Order.deleteMany({ userId: ctx.userId, status: { $ne: 'paid' } });
    return ctx;
  },
  async compensate() {
    // No rollback needed for cleanup
  },
};

export const validateVoucherStep: SagaStep<BookingContext> = {
  name: 'validate-voucher',
  async execute(ctx) {
    ctx.subtotal = ctx.items.reduce(
      (sum: number, item: any) => sum + item.price * (item.quantity || 1),
      0,
    );
    ctx.totalAmount = ctx.subtotal;
    ctx.voucherDiscount = 0;
    const totalTickets = ctx.items.reduce(
      (sum: number, item: any) => sum + (item.quantity || 1),
      0,
    );
    ctx.voucherTicketCount = totalTickets;

    if (!ctx.rawVoucherCode) return ctx;

    const normalizedCode = String(ctx.rawVoucherCode).trim().toUpperCase();
    const now = new Date();

    const voucher = await Voucher.findOne({
      code: normalizedCode,
      status: 'active',
      $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }],
    });

    if (!voucher) throw new Error('Ma voucher khong hop le hoac khong ton tai');
    if (voucher.endDate && voucher.endDate < now) throw new Error('Ma voucher da het han');
    if (voucher.maxUses && voucher.usedCount + totalTickets > voucher.maxUses)
      throw new Error('Ma voucher da su dung toi da');
    if (voucher.minimumPrice && ctx.subtotal! < voucher.minimumPrice)
      throw new Error(`Don hang phai toi thieu ${voucher.minimumPrice} de dung ma nay`);
    if (voucher.eventId && voucher.eventId !== ctx.eventId)
      throw new Error('Ma voucher khong ap dung cho su kien nay');
    if (voucher.userId && voucher.userId !== ctx.userId)
      throw new Error('Ma voucher nay chi ap dung cho tai khoan da duoc cap');

    let discount = 0;
    if (voucher.discountType === 'percentage') {
      discount = Math.floor((ctx.subtotal! * Number(voucher.discountValue || 0)) / 100);
    } else {
      discount = Number(voucher.discountValue || 0);
    }
    if (discount < 0) discount = 0;
    if (discount > ctx.subtotal!) discount = ctx.subtotal!;

    ctx.totalAmount = ctx.subtotal! - discount;
    ctx.voucherDiscount = discount;
    ctx.voucherCode = normalizedCode;
    ctx.voucherId = voucher._id.toString();
    ctx.voucherDoc = voucher;

    voucher.usedCount += totalTickets;
    await voucher.save();

    return ctx;
  },
  async compensate(ctx) {
    if (ctx.voucherDoc) {
      try {
        const ticketCount = ctx.voucherTicketCount || 1;
        ctx.voucherDoc.usedCount = Math.max(0, ctx.voucherDoc.usedCount - ticketCount);
        await ctx.voucherDoc.save();
      } catch (e: any) {
        console.warn('[BookingSaga] Compensate voucher failed:', e?.message);
      }
    }
  },
};

const createOrderStep: SagaStep<BookingContext> = {
  name: 'create-order',
  async execute(ctx) {
    ctx.commissionAmount = Math.round(ctx.totalAmount! * ctx.commissionRate);
    ctx.organizerAmount = ctx.totalAmount! - ctx.commissionAmount;

    const timestamp = Date.now() % 1_000_000_000;
    const random = Math.floor(Math.random() * 1000);
    ctx.orderCode = timestamp * 1000 + random;

    ctx.order = await Order.create({
      orderCode: ctx.orderCode,
      userId: ctx.userId,
      eventId: ctx.eventId,
      eventName: ctx.eventName,
      organizerId: ctx.organizerId,
      organizerBank: ctx.organizerBank,
      items: ctx.items,
      subtotal: ctx.subtotal,
      commissionRate: ctx.commissionRate,
      commissionAmount: ctx.commissionAmount,
      organizerAmount: ctx.organizerAmount,
      totalAmount: ctx.totalAmount,
      voucherCode: ctx.voucherCode,
      voucherDiscount: ctx.voucherDiscount,
      voucherId: ctx.voucherId,
      channel: ctx.channel,
      status: 'pending',
    });

    return ctx;
  },
  async compensate(ctx) {
    if (ctx.order?._id) {
      try {
        await Order.deleteOne({ _id: ctx.order._id });
        console.log(`[BookingSaga] Compensated: deleted order ${ctx.orderCode}`);
      } catch (e: any) {
        console.warn('[BookingSaga] Compensate order delete failed:', e?.message);
      }
    }
  },
};

const createPayOSLinkStep: SagaStep<BookingContext> = {
  name: 'create-payos-link',
  async execute(ctx) {
    const payosItems = ctx.items.map((item: any) => ({
      name: `${ctx.eventName} - ${item.zoneName}`,
      quantity: item.quantity || 1,
      price: item.price,
    }));

    const paymentData = {
      orderCode: ctx.orderCode!,
      amount: ctx.totalAmount!,
      description: `Ve ${ctx.eventName}`.substring(0, 25),
      items: payosItems,
      returnUrl: `${ctx.frontendUrl}/payment-success?orderCode=${ctx.orderCode}`,
      cancelUrl: `${ctx.frontendUrl}/payment-cancel?orderCode=${ctx.orderCode}`,
    };

    ctx.paymentLink = await ctx.payosClient!.createPaymentLink(paymentData);

    ctx.order.payosPaymentLinkId = ctx.paymentLink.paymentLinkId;
    ctx.order.payosCheckoutUrl = ctx.paymentLink.checkoutUrl;
    ctx.order.qrCode = ctx.paymentLink.qrCode;
    ctx.order.status = 'processing';
    await ctx.order.save();

    return ctx;
  },
  async compensate(ctx) {
    if (ctx.paymentLink?.paymentLinkId && ctx.payosClient) {
      try {
        await ctx.payosClient.cancelPaymentLink(ctx.paymentLink.paymentLinkId);
      } catch (e: any) {
        console.warn('[BookingSaga] Compensate PayOS cancel failed:', e?.message);
      }
    }
  },
};

export function createBookingSaga() {
  return new SagaOrchestrator<BookingContext>('BookingSaga', [
    cleanupStep,
    validateVoucherStep,
    createOrderStep,
    createPayOSLinkStep,
  ]);
}
