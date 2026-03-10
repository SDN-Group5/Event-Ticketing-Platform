import { SagaOrchestrator, SagaStep } from './sagaOrchestrator';
import { Order } from '../models/order.model';
import { releaseSeatsForOrder } from '../services/seatRelease.service';
import PayOS from '@payos/node';

export interface CancelContext {
  order: any;
  payosClient?: PayOS;
}
// lấy ra payos link
const cancelPayOSStep: SagaStep<CancelContext> = {
  name: 'cancel-payos-link',
  async execute(ctx) {
    if (ctx.order.payosPaymentLinkId && ctx.payosClient) {
      try {
        await ctx.payosClient.cancelPaymentLink(ctx.order.payosPaymentLinkId);
      } catch (e: any) {
        console.warn('[CancelSaga] PayOS cancel failed (may already be cancelled):', e?.message);
      }
    }
    return ctx;
  },
  async compensate() {
    // Cannot un-cancel a PayOS link
  },
};

const releaseSeatsStep: SagaStep<CancelContext> = {
  name: 'release-seats',
  async execute(ctx) {
    await releaseSeatsForOrder(ctx.order);
    return ctx;
  },
  async compensate() {
    // Seat release is idempotent, no rollback needed
  },
};

const deleteOrderStep: SagaStep<CancelContext> = {
  name: 'delete-order',
  async execute(ctx) {
    await Order.deleteOne({ _id: ctx.order._id });
    return ctx;
  },
  async compensate() {
    // Order already deleted, cannot rollback
  },
};

export function createCancelSaga() {
  return new SagaOrchestrator<CancelContext>('CancelSaga', [
    cancelPayOSStep,
    releaseSeatsStep,
    deleteOrderStep,
  ]);
}
