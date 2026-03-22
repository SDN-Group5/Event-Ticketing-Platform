import { SagaOrchestrator, SagaStep } from './sagaOrchestrator';
import { Voucher } from '../models/voucher.model';
import { publishEvent } from '../config/rabbitmq';
import { transferToOrganizerBank } from '../services/bankTransfer.service';
import { sendPaymentConfirmationEmail, sendTicketQREmail } from '../services/email.service';
import { getUserFromAuthService } from '../services/user.service';
import { createTicketsForOrder } from '../services/ticket.service';
import QRCode from 'qrcode';

export interface PaymentCompleteContext {
  order: any;
  previousStatus?: string;
  /** Dùng khi compensate: trừ lại usedCount đã cộng */
  voucherUsedIncrement?: number;
  voucherDoc?: any;
}

const markPaidStep: SagaStep<PaymentCompleteContext> = {
  name: 'mark-order-paid',
  async execute(ctx) {
    ctx.previousStatus = ctx.order.status;
    ctx.order.status = 'paid';
    ctx.order.paidAt = new Date();
    await ctx.order.save();
    return ctx;
  },
  async compensate(ctx) {
    try {
      ctx.order.status = ctx.previousStatus || 'processing';
      ctx.order.paidAt = undefined;
      await ctx.order.save();
    } catch (e: any) {
      console.warn('[PaymentCompleteSaga] Compensate mark-paid failed:', e?.message);
    }
  },
};

/** Chỉ tăng voucher.usedCount khi thanh toán thực sự thành công (user đã trả tiền). */
const incrementVoucherUsedStep: SagaStep<PaymentCompleteContext> = {
  name: 'increment-voucher-used',
  async execute(ctx) {
    const order = ctx.order;
    if (!order.voucherId && !order.voucherCode) return ctx;

    const voucher = order.voucherId
      ? await Voucher.findById(order.voucherId)
      : await Voucher.findOne({ code: String(order.voucherCode).trim().toUpperCase() });
    if (!voucher) return ctx;

    const totalTickets = (order.items || []).reduce(
      (sum: number, item: any) => sum + (item.quantity || 1),
      0,
    );
    const isCancelVoucher = String(voucher.code || '').startsWith('CANCEL-');
    const increment = isCancelVoucher ? 1 : totalTickets;

    voucher.usedCount = (voucher.usedCount || 0) + increment;
    await voucher.save();

    ctx.voucherDoc = voucher;
    ctx.voucherUsedIncrement = increment;
    return ctx;
  },
  async compensate(ctx) {
    if (ctx.voucherDoc && ctx.voucherUsedIncrement != null) {
      try {
        ctx.voucherDoc.usedCount = Math.max(
          0,
          (ctx.voucherDoc.usedCount || 0) - ctx.voucherUsedIncrement,
        );
        await ctx.voucherDoc.save();
      } catch (e: any) {
        console.warn('[PaymentCompleteSaga] Compensate voucher usedCount failed:', e?.message);
      }
    }
  },
};

const markSeatsSoldStep: SagaStep<PaymentCompleteContext> = {
  name: 'mark-seats-sold',
  async execute(ctx) {
    const seatIds = (ctx.order.items || [])
      .filter((item: any) => item.seatId)
      .map((item: any) => item.seatId);

    if (seatIds.length > 0) {
      await publishEvent('seats.bulk_sold', {
        eventId: ctx.order.eventId,
        seatIds,
        userId: ctx.order.userId,
        bookingId: String(ctx.order.orderCode),
      });
    }
    return ctx;
  },
  async compensate(ctx) {
    const seatIds = (ctx.order.items || [])
      .filter((item: any) => item.seatId)
      .map((item: any) => item.seatId);

    if (seatIds.length > 0) {
      try {
        await publishEvent('seats.release', {
          eventId: ctx.order.eventId,
          seatIds,
          orderCode: ctx.order.orderCode,
        });
      } catch (e: any) {
        console.warn('[PaymentCompleteSaga] Compensate seats release failed:', e?.message);
      }
    }
  },
};

const autoPayoutStep: SagaStep<PaymentCompleteContext> = {
  name: 'auto-payout',
  async execute(ctx) {
    const order = ctx.order;

    if (!order.organizerAmount || order.organizerAmount <= 0) {
      order.payoutStatus = 'skipped';
      await order.save();
      return ctx;
    }

    const bank = order.organizerBank;
    if (!bank || !bank.bankAccountNumber || !bank.bankAccountName) {
      order.payoutStatus = 'skipped';
      await order.save();
      return ctx;
    }

    if (!process.env.BANK_API_BASE_URL) {
      order.payoutStatus = 'skipped';
      await order.save();
      return ctx;
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
      order.payoutStatus = 'failed';
      order.payoutError = err?.message || 'Payout failed';
    }

    await order.save();
    return ctx;
  },
  async compensate(ctx) {
    try {
      ctx.order.payoutStatus = 'failed';
      ctx.order.payoutError = 'Rolled back by saga';
      await ctx.order.save();
    } catch (e: any) {
      console.warn('[PaymentCompleteSaga] Compensate payout failed:', e?.message);
    }
  },
};

const sendEmailStep: SagaStep<PaymentCompleteContext> = {
  name: 'send-confirmation-email',
  async execute(ctx) {
    try {
      const order = ctx.order;
      
      // Fetch user information from auth service
      const user = await getUserFromAuthService(order.userId);
      
      if (!user || !user.email) {
        console.warn(`[PaymentCompleteSaga] Could not fetch user ${order.userId} email, skipping email send`);
        return ctx;
      }

      // Calculate ticket count
      const ticketCount = (order.items || []).reduce((total: number, item: any) => total + (item.quantity || 1), 0);

      // Send confirmation email
      const emailSent = await sendPaymentConfirmationEmail({
        to: user.email,
        firstName: user.firstName,
        eventName: order.eventName,
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
        items: order.items || [],
        ticketCount,
      });

      if (!emailSent) {
        console.warn(`[PaymentCompleteSaga] Failed to send email to ${user.email}, but continuing...`);
      }

      return ctx;
    } catch (err: any) {
      console.error('[PaymentCompleteSaga] Error in send-email step:', err?.message);
      // Don't fail the saga if email fails - it's not critical
      return ctx;
    }
  },
  async compensate(ctx) {
    // Email doesn't need compensation - it's informational only
  },
};

const createTicketsStep: SagaStep<PaymentCompleteContext> = {
  name: 'create-tickets',
  async execute(ctx) {
    try {
      const order = ctx.order;
      
      // Create tickets with QR codes for each item
      const tickets = await createTicketsForOrder(
        order._id.toString(),
        order.orderCode,
        order.userId,
        order.eventId,
        order.eventName,
        order.items || []
      );

      // Store tickets in context for next step
      (ctx as any).tickets = tickets;

      return ctx;
    } catch (err: any) {
      console.error('[PaymentCompleteSaga] Error in create-tickets step:', err?.message);
      // Don't fail saga if ticket creation fails - order is already paid
      return ctx;
    }
  },
  async compensate(ctx) {
    // Ticket creation doesn't need compensation for now
    // In future, could mark tickets as cancelled
  },
};

const sendTicketQRStep: SagaStep<PaymentCompleteContext> = {
  name: 'send-ticket-qr-email',
  async execute(ctx) {
    try {
      const order = ctx.order;
      const tickets = (ctx as any).tickets;

      if (!tickets || tickets.length === 0) {
        console.warn(`[PaymentCompleteSaga] No tickets found for order ${order.orderCode}, skipping QR email`);
        return ctx;
      }

      // Fetch user information
      const user = await getUserFromAuthService(order.userId);
      
      if (!user || !user.email) {
        console.warn(`[PaymentCompleteSaga] Could not fetch user ${order.userId} email, skipping QR email`);
        return ctx;
      }

      // Generate QR Code Buffers
      const ticketsWithQRBuffers = await Promise.all(
        tickets.map(async (ticket: any) => {
          const qrCodeBuffer = await QRCode.toBuffer(ticket.qrCodePayload || ticket.ticketId);
          return {
            ...ticket,
            qrCodeBuffer,
          };
        })
      );

      // Send ticket QR email
      const qrEmailSent = await sendTicketQREmail({
        to: user.email,
        firstName: user.firstName,
        eventName: order.eventName,
        orderCode: order.orderCode,
        tickets: ticketsWithQRBuffers,
      });

      if (!qrEmailSent) {
        console.warn(`[PaymentCompleteSaga] Failed to send ticket QR email to ${user.email}, but continuing...`);
      }

      return ctx;
    } catch (err: any) {
      console.error('[PaymentCompleteSaga] Error in send-ticket-qr-email step:', err?.message);
      // Don't fail the saga if email fails - it's not critical
      return ctx;
    }
  },
  async compensate(ctx) {
    // Email doesn't need compensation
  },
};

export function createPaymentCompleteSaga() {
  return new SagaOrchestrator<PaymentCompleteContext>('PaymentCompleteSaga', [
    markPaidStep,
    incrementVoucherUsedStep,
    markSeatsSoldStep,
    autoPayoutStep,
    sendEmailStep,
    createTicketsStep,
    sendTicketQRStep,
  ]);
}
