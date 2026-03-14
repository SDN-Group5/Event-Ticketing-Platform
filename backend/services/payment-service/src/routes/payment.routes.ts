import { Router } from 'express';
import {
  createPayment,
  getOrder,
  getUserOrders,
  getOrganizerOrders,
  getOrganizerCustomers,
  handleWebhook,
  cancelPayment,
  verifyPayment,
} from '../controllers/payment.controller';
import { getPublicTicketByTicketId } from '../controllers/ticket.controller';
import {
  cancelPaidOrderWithVoucher,
} from '../controllers/payment.controller';
import {
  getOrganizerVouchers,
  getUserVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  previewVoucher,
} from '../controllers/voucher.controller';
import { extractUserId, verifyOrganizer } from '../middleware/auth.middleware';

const router = Router();

// Tạo đơn hàng + payment link PayOS
router.post('/create', createPayment);

// PayOS webhook
router.post('/webhook', handleWebhook);

// Kiểm tra trạng thái thanh toán
router.get('/verify/:orderCode', verifyPayment);

// Lấy thông tin đơn hàng
router.get('/order/:orderCode', getOrder);

// ⚠️ PHẢI đặt trước /user/:userId để Express không bắt nhầm
// Lấy danh sách voucher của user hiện tại (refund vouchers)
router.get('/user/vouchers', getUserVouchers);

// Lấy danh sách đơn hàng của user
router.get('/user/:userId', getUserOrders);

// Public: lấy 1 vé theo ticketId (để share link render trên web)
router.get('/tickets/public/:ticketId', getPublicTicketByTicketId);

// Huỷ đơn hàng
router.post('/cancel/:orderCode', cancelPayment);

// Huỷ đơn đã thanh toán nhưng cấp voucher 50% thay vì hoàn tiền
router.post('/cancel-with-voucher/:orderCode', extractUserId, cancelPaidOrderWithVoucher);

// ================== ORGANIZER - ORDERS & CUSTOMERS ==================
router.get('/organizer/orders', extractUserId, verifyOrganizer, getOrganizerOrders);
router.get('/organizer/customers', extractUserId, verifyOrganizer, getOrganizerCustomers);

// Preview voucher cho khách trước khi tạo đơn
router.post('/vouchers/preview', previewVoucher);

// ================== VOUCHERS (ORGANIZER) ==================
router.get('/organizer/vouchers', extractUserId, verifyOrganizer, getOrganizerVouchers);
router.post('/organizer/vouchers', extractUserId, verifyOrganizer, createVoucher);
router.put('/organizer/vouchers/:id', extractUserId, verifyOrganizer, updateVoucher);
router.delete('/organizer/vouchers/:id', extractUserId, verifyOrganizer, deleteVoucher);

export default router;
