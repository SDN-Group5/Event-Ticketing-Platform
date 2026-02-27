import { Router } from 'express';
import {
  createPayment,
  getOrder,
  getUserOrders,
  handleWebhook,
  cancelPayment,
  verifyPayment,
} from '../controllers/payment.controller';

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

export default router;
