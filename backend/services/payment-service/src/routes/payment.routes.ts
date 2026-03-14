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
  markEventPayoutSuccess,
} from '../controllers/payment.controller';
import {
  cancelPaidOrderWithVoucher,
} from '../controllers/payment.controller';
import {
  getOrganizerVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  previewVoucher,
} from '../controllers/voucher.controller';
import { extractUserId, verifyOrganizer } from '../middleware/auth.middleware';

const router = Router();

// Tạo đơn hàng + payment link PayOS
router.post('/create', createPayment);

// PayOS webhook (PayOS gọi về khi thanh toán xong)
router.post('/webhook', handleWebhook);

// Kiểm tra trạng thái thanh toán (FE gọi sau khi return từ PayOS)
router.get('/verify/:orderCode', verifyPayment);

// Lấy thông tin đơn hàng
router.get('/order/:orderCode', getOrder);

// Lấy danh sách đơn hàng của user
router.get('/user/:userId', getUserOrders);

// Huỷ đơn hàng
router.post('/cancel/:orderCode', cancelPayment);

// Huỷ đơn đã thanh toán nhưng cấp voucher 50% thay vì hoàn tiền
router.post('/cancel-with-voucher/:orderCode', cancelPaidOrderWithVoucher);

// ================== ORGANIZER - ORDERS & CUSTOMERS ==================
// Lấy danh sách đơn hàng của organizer (tất cả sự kiện)
router.get('/organizer/orders', extractUserId, verifyOrganizer, getOrganizerOrders);

// Lấy danh sách khách hàng của organizer
router.get('/organizer/customers', extractUserId, verifyOrganizer, getOrganizerCustomers);

// Preview voucher cho khách trước khi tạo đơn
router.post('/vouchers/preview', previewVoucher);

// ================== VOUCHERS (ORGANIZER) ==================
// Lấy danh sách voucher của organizer hiện tại
router.get('/organizer/vouchers', extractUserId, verifyOrganizer, getOrganizerVouchers);

// Tạo voucher mới
router.post('/organizer/vouchers', extractUserId, verifyOrganizer, createVoucher);

// Cập nhật voucher
router.put('/organizer/vouchers/:id', extractUserId, verifyOrganizer, updateVoucher);

// Xoá voucher
router.delete('/organizer/vouchers/:id', extractUserId, verifyOrganizer, deleteVoucher);

// ================== ADMIN ==================
// Đánh dấu orders của sự kiện là đã payout thành công
router.patch('/admin/payout-event/:eventId', markEventPayoutSuccess);

export default router;
