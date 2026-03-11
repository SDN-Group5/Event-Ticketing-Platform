import { SagaOrchestrator, SagaStep } from './sagaOrchestrator';
import { Voucher } from '../models/voucher.model';
import { releaseSeatsForOrder } from '../services/seatRelease.service';
import { publishEvent } from '../config/rabbitmq';

export interface CancelVoucherContext {
  order: any;
  voucherValue: number;
  voucher?: any;
}

const createVoucherStep: SagaStep<CancelVoucherContext> = {
  name: 'create-voucher',
  async execute(ctx) {
    const baseCode = `CANCEL-${ctx.order.orderCode}`;
    let code = baseCode;
    let suffix = 0;

    while (await Voucher.findOne({ code })) {
      suffix += 1;
      code = `${baseCode}-${suffix}`;
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    ctx.voucher = await Voucher.create({
      code,
      description: `Voucher 50% gia tri don ${ctx.order.orderCode}`,
      discountType: 'fixed',
      discountValue: ctx.voucherValue,
      maxUses: 1,
      usedCount: 0,
      startDate: now,
      endDate,
      minimumPrice: undefined,
      status: 'active',
      organizerId: ctx.order.organizerId,
      eventId: ctx.order.eventId,
      userId: ctx.order.userId,
    });

    return ctx;
  },
  async compensate(ctx) {
    if (ctx.voucher?._id) {
      try {
        await Voucher.deleteOne({ _id: ctx.voucher._id });
        console.log('[CancelVoucherSaga] Compensated: deleted voucher');
      } catch (e: any) {
        console.warn('[CancelVoucherSaga] Compensate voucher delete failed:', e?.message);
      }
    }
  },
};

const updateOrderStep: SagaStep<CancelVoucherContext> = {
  name: 'update-order-refunded',
  async execute(ctx) {
    ctx.order.status = 'refunded';
    ctx.order.cancelledAt = new Date();
    (ctx.order as any).voucherCode = ctx.voucher.code;
    (ctx.order as any).voucherDiscount = ctx.voucher.discountValue;
    (ctx.order as any).voucherId = ctx.voucher._id.toString();
    await ctx.order.save();
    return ctx;
  },
  async compensate(ctx) {
    try {
      ctx.order.status = 'paid';
      ctx.order.cancelledAt = undefined;
      await ctx.order.save();
    } catch (e: any) {
      console.warn('[CancelVoucherSaga] Compensate order revert failed:', e?.message);
    }
  },
};

const releaseSeatsStep: SagaStep<CancelVoucherContext> = {
  name: 'release-seats',
  async execute(ctx) {
    await releaseSeatsForOrder(ctx.order);
    return ctx;
  },
  async compensate(ctx) {
    const seatIds = (ctx.order.items || [])
      .filter((item: any) => item.seatId)
      .map((item: any) => item.seatId);

    if (seatIds.length > 0) {
      try {
        await publishEvent('seats.bulk_sold', {
          eventId: ctx.order.eventId,
          seatIds,
          userId: ctx.order.userId,
          bookingId: String(ctx.order.orderCode),
        });
      } catch (e: any) {
        console.warn('[CancelVoucherSaga] Compensate seats re-sold failed:', e?.message);
      }
    }
  },
};

export function createCancelVoucherSaga() {
  return new SagaOrchestrator<CancelVoucherContext>('CancelVoucherSaga', [
    createVoucherStep,
    updateOrderStep,
    releaseSeatsStep,
  ]);
}
