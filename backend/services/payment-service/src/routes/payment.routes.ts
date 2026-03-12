import { Router } from 'express';
import {
  createPayment,
  getOrder,
  getUserOrders,
  handleWebhook,
  cancelPayment,
  verifyPayment,
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

// Preview voucher cho khách trước khi tạo đơn
router.post('/vouchers/preview', previewVoucher);

// ================== VOUCHERS (ORGANIZER) ==================
// Lấy danh sách voucher của organizer hiện tại
router.get('/organizer/vouchers', getOrganizerVouchers);

// Tạo voucher mới
router.post('/organizer/vouchers', createVoucher);

// Cập nhật voucher
router.put('/organizer/vouchers/:id', updateVoucher);

// Xoá voucher
router.delete('/organizer/vouchers/:id', deleteVoucher);

export default router;
