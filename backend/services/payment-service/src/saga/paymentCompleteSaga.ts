// ============================================================
// PAYMENT COMPLETE SAGA
//
// Chạy sau khi PayOS xác nhận user đã thanh toán thành công.
// Gồm 7 bước tuần tự:
//   1. mark-order-paid          — đánh dấu đơn hàng là 'paid'
//   2. increment-voucher-used   — cộng lượt dùng voucher
//   3. mark-seats-sold          — đánh dấu ghế đã bán
//   4. auto-payout              — chuyển tiền cho organizer
//   5. send-confirmation-email  — gửi email xác nhận
//   6. create-tickets           — tạo vé (kèm QR code)
//   7. send-ticket-qr-email     — gửi email đính kèm vé QR
//
// Nếu bước nào lỗi → tự động compensate ngược lại.
// ============================================================
import { SagaOrchestrator, SagaStep } from './sagaOrchestrator';
import { Voucher } from '../models/voucher.model';
import { publishEvent } from '../config/rabbitmq';
import { transferToOrganizerBank } from '../services/bankTransfer.service';
import { sendPaymentConfirmationEmail, sendTicketQREmail } from '../services/email.service';
import { getUserFromAuthService } from '../services/user.service';
import { createTicketsForOrder } from '../services/ticket.service';
import QRCode from 'qrcode';

// Túi dữ liệu truyền qua tất cả các bước trong Saga này
export interface PaymentCompleteContext {
  order: any;
  previousStatus?: string;        // lưu trạng thái cũ trước khi mark paid (dùng khi rollback)
  voucherUsedIncrement?: number;  // số lượt voucher đã cộng (dùng khi rollback)
  voucherDoc?: any;               // document voucher trong DB (dùng khi rollback)
}

// ─── BƯỚC 1: MARK ORDER PAID ────────────────────────────────
// Đánh dấu đơn hàng là 'paid' và ghi thời gian thanh toán.
// Rollback: khôi phục lại trạng thái cũ trước khi paid.
const markPaidStep: SagaStep<PaymentCompleteContext> = {
  name: 'mark-order-paid',
  async execute(ctx) {
    ctx.previousStatus = ctx.order.status;  // lưu lại trạng thái cũ để rollback nếu cần
    ctx.order.status = 'paid';
    ctx.order.paidAt = new Date();
    await ctx.order.save();
    return ctx;
  },
  async compensate(ctx) {
    try {
      // Hoàn tác: trả về trạng thái trước đó
      ctx.order.status = ctx.previousStatus || 'processing';
      ctx.order.paidAt = undefined;
      await ctx.order.save();
    } catch (e: any) {
      console.warn('[PaymentCompleteSaga] Compensate mark-paid failed:', e?.message);
    }
  },
};

// ─── BƯỚC 2: TĂNG VOUCHER USED COUNT ───────────────────────
// Chỉ tăng voucher.usedCount khi thanh toán thực sự thành công (user đã trả tiền).
// Rollback: trừ lại số lượt đã cộng.
const incrementVoucherUsedStep: SagaStep<PaymentCompleteContext> = {
  name: 'increment-voucher-used',
  async execute(ctx) {
    const order = ctx.order;

    // Không có voucher → bỏ qua bước này
    if (!order.voucherId && !order.voucherCode) return ctx;

    // Tìm voucher trong DB (ưu tiên theo ID, fallback theo code)
    const voucher = order.voucherId
      ? await Voucher.findById(order.voucherId)
      : await Voucher.findOne({ code: String(order.voucherCode).trim().toUpperCase() });
    if (!voucher) return ctx;

    // Tính số lượt cần cộng
    const totalTickets = (order.items || []).reduce(
      (sum: number, item: any) => sum + (item.quantity || 1),
      0,
    );
    // Voucher dạng CANCEL-* tính 1 lượt/đơn, voucher thường tính theo số vé
    const isCancelVoucher = String(voucher.code || '').startsWith('CANCEL-');
    const increment = isCancelVoucher ? 1 : totalTickets;

    voucher.usedCount = (voucher.usedCount || 0) + increment;
    await voucher.save();

    // Lưu vào context để dùng khi rollback
    ctx.voucherDoc = voucher;
    ctx.voucherUsedIncrement = increment;
    return ctx;
  },
  async compensate(ctx) {
    // Hoàn tác: trừ lại số lượt đã cộng
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

// ─── BƯỚC 3: ĐÁNH DẤU GHẾ ĐÃ BÁN ──────────────────────────
// Publish event RabbitMQ để booking-service/seat-service cập nhật trạng thái ghế → 'sold'.
// Rollback: publish event giải phóng ghế (seats.release).
const markSeatsSoldStep: SagaStep<PaymentCompleteContext> = {
  name: 'mark-seats-sold',
  async execute(ctx) {
    // Lấy danh sách seatId từ các item trong đơn hàng
    const seatIds = (ctx.order.items || [])
      .filter((item: any) => item.seatId)
      .map((item: any) => item.seatId);

    if (seatIds.length > 0) {
      // Gửi message qua RabbitMQ để các service khác biết ghế đã được bán
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
    // Hoàn tác: gửi message để giải phóng ghế đã đánh dấu sold
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

// ─── BƯỚC 4: TỰ ĐỘNG CHUYỂN TIỀN CHO ORGANIZER ─────────────
// Chuyển phần tiền của organizer (sau khi trừ hoa hồng) vào tài khoản ngân hàng.
// Bỏ qua (skipped) nếu: không có tiền, thiếu thông tin bank, hoặc chưa cấu hình API bank.
// Rollback: đánh dấu payoutStatus = 'failed' (không hoàn tiền thật được).
const autoPayoutStep: SagaStep<PaymentCompleteContext> = {
  name: 'auto-payout',
  async execute(ctx) {
    const order = ctx.order;

    // Không có tiền để chuyển → bỏ qua
    if (!order.organizerAmount || order.organizerAmount <= 0) {
      order.payoutStatus = 'skipped';
      await order.save();
      return ctx;
    }

    // Thiếu thông tin ngân hàng của organizer → bỏ qua
    const bank = order.organizerBank;
    if (!bank || !bank.bankAccountNumber || !bank.bankAccountName) {
      order.payoutStatus = 'skipped';
      await order.save();
      return ctx;
    }

    // Chưa cấu hình API ngân hàng trong .env → bỏ qua
    if (!process.env.BANK_API_BASE_URL) {
      order.payoutStatus = 'skipped';
      await order.save();
      return ctx;
    }

    try {
      // Gọi API chuyển tiền thật vào tài khoản organizer
      const result = await transferToOrganizerBank({
        toAccountNumber: bank.bankAccountNumber,
        toAccountName: bank.bankAccountName,
        bankCode: bank.bankCode,
        bankName: bank.bankName,
        amount: order.organizerAmount,
        description: `Payout cho organizer ${order.organizerId} - order ${order.orderCode}`,
      });

      // Chuyển thành công → lưu mã giao dịch
      order.payoutStatus = 'success';
      order.payoutTxnId = result.transactionId;
      order.payoutAt = new Date();
      order.payoutError = undefined;
    } catch (err: any) {
      // Chuyển thất bại → ghi lỗi nhưng không throw (saga vẫn tiếp tục)
      order.payoutStatus = 'failed';
      order.payoutError = err?.message || 'Payout failed';
    }

    await order.save();
    return ctx;
  },
  async compensate(ctx) {
    // Không thể hoàn tiền ngân hàng tự động → chỉ đánh dấu lại trạng thái
    try {
      ctx.order.payoutStatus = 'failed';
      ctx.order.payoutError = 'Rolled back by saga';
      await ctx.order.save();
    } catch (e: any) {
      console.warn('[PaymentCompleteSaga] Compensate payout failed:', e?.message);
    }
  },
};

// ─── BƯỚC 5: GỬI EMAIL XÁC NHẬN THANH TOÁN ─────────────────
// Lấy thông tin user từ auth-service rồi gửi email thông báo thanh toán thành công.
// Không rollback — email chỉ mang tính thông tin, lỗi email không làm saga thất bại.
const sendEmailStep: SagaStep<PaymentCompleteContext> = {
  name: 'send-confirmation-email',
  async execute(ctx) {
    try {
      const order = ctx.order;
      
      // Gọi auth-service để lấy email và tên user
      const user = await getUserFromAuthService(order.userId);
      
      if (!user || !user.email) {
        console.warn(`[PaymentCompleteSaga] Could not fetch user ${order.userId} email, skipping email send`);
        return ctx;
      }

      // Tổng số vé trong đơn
      const ticketCount = (order.items || []).reduce((total: number, item: any) => total + (item.quantity || 1), 0);

      // Gửi email xác nhận thanh toán
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
      // Lỗi email không làm saga thất bại — chỉ log và tiếp tục
      console.error('[PaymentCompleteSaga] Error in send-email step:', err?.message);
      return ctx;
    }
  },
  async compensate(ctx) {
    // Email không cần rollback
  },
};

// ─── BƯỚC 6: TẠO VÉ (TICKET + QR CODE) ─────────────────────
// Tạo các vé điện tử kèm QR code cho từng ghế trong đơn hàng.
// Lưu danh sách vé vào context để bước 7 dùng.
// Lỗi không làm saga thất bại vì đơn hàng đã paid rồi.
const createTicketsStep: SagaStep<PaymentCompleteContext> = {
  name: 'create-tickets',
  async execute(ctx) {
    try {
      const order = ctx.order;
      
      // Gọi service tạo vé cho từng item trong đơn
      const tickets = await createTicketsForOrder(
        order._id.toString(),
        order.orderCode,
        order.userId,
        order.eventId,
        order.eventName,
        order.items || []
      );

      // Lưu danh sách vé vào context để bước send-ticket-qr-email dùng tiếp
      (ctx as any).tickets = tickets;

      return ctx;
    } catch (err: any) {
      // Không throw — đơn hàng đã paid, vé lỗi có thể xử lý sau
      console.error('[PaymentCompleteSaga] Error in create-tickets step:', err?.message);
      return ctx;
    }
  },
  async compensate(ctx) {
    // Hiện tại không cần rollback vé
    // Tương lai có thể thêm: đánh dấu vé là cancelled
  },
};

// ─── BƯỚC 7: GỬI EMAIL VÉ QR ────────────────────────────────
// Lấy danh sách vé từ context (bước 6), generate buffer QR code,
// rồi gửi email đính kèm QR code cho từng vé.
// Lỗi email không làm saga thất bại.
const sendTicketQRStep: SagaStep<PaymentCompleteContext> = {
  name: 'send-ticket-qr-email',
  async execute(ctx) {
    try {
      const order = ctx.order;
      const tickets = (ctx as any).tickets; // lấy từ bước create-tickets

      if (!tickets || tickets.length === 0) {
        console.warn(`[PaymentCompleteSaga] No tickets found for order ${order.orderCode}, skipping QR email`);
        return ctx;
      }

      // Lấy thông tin user để gửi email
      const user = await getUserFromAuthService(order.userId);
      
      if (!user || !user.email) {
        console.warn(`[PaymentCompleteSaga] Could not fetch user ${order.userId} email, skipping QR email`);
        return ctx;
      }

      // Tạo buffer hình ảnh QR code cho từng vé
      const ticketsWithQRBuffers = await Promise.all(
        tickets.map(async (ticket: any) => {
          const qrCodeBuffer = await QRCode.toBuffer(ticket.qrCodePayload || ticket.ticketId);
          return {
            ...ticket,
            qrCodeBuffer,
          };
        })
      );

      // Gửi email đính kèm QR code
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
      // Lỗi email không làm saga thất bại
      console.error('[PaymentCompleteSaga] Error in send-ticket-qr-email step:', err?.message);
      return ctx;
    }
  },
  async compensate(ctx) {
    // Email không cần rollback
  },
};

// ─── EXPORT: Tạo instance PaymentCompleteSaga ───────────────
// Truyền 7 bước vào SagaOrchestrator để chạy tuần tự.
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
