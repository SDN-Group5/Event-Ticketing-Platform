import axios from 'axios';

const PAYMENT_API = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
const PAYMENT_CHANNEL: 'jsp' | 'mobile' = 'jsp'; // Web hiện tại dùng kênh JSP/SERVLET (tài khoản A)

const paymentClient = axios.create({
  baseURL: `${PAYMENT_API}/api/payments`,
  headers: { 'Content-Type': 'application/json' },
});

paymentClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreatePaymentInput {
  userId: string;
  eventId: string;
  eventName: string;
  organizerId: string;
  items: {
    zoneName: string;
    seatId?: string;
    seatLabel?: string;
    price: number;
    quantity: number;
  }[];
  voucherCode?: string;
}

export interface PaymentResponse {
  orderId: string;
  orderCode: number;
  subtotal: number;
  voucherDiscount?: number;
  voucherCode?: string;
  totalAmount: number;
  commissionAmount: number;
  organizerAmount: number;
  checkoutUrl: string;
  qrCode: string;
  paymentLinkId: string;
}

export interface VerifyResponse {
  status: string;
  order: any;
  payosStatus?: string;
}

export interface VoucherPreviewResponse {
  subtotal: number;
  voucherDiscount: number;
  totalAmount: number;
  voucherCode?: string | null;
}

export const PaymentAPI = {
  async createPayment(data: CreatePaymentInput): Promise<PaymentResponse> {
    const res = await paymentClient.post('/create', {
      ...data,
      channel: PAYMENT_CHANNEL,
    });
    return res.data.data;
  },

  async verifyPayment(orderCode: number | string): Promise<VerifyResponse> {
    const res = await paymentClient.get(`/verify/${orderCode}`);
    return res.data.data;
  },

  async getOrder(orderCode: number | string) {
    const res = await paymentClient.get(`/order/${orderCode}`);
    return res.data.data;
  },

  async getUserOrders(userId: string) {
    const res = await paymentClient.get(`/user/${userId}`);
    return res.data.data;
  },

  async cancelPayment(orderCode: number | string) {
    const res = await paymentClient.post(`/cancel/${orderCode}`);
    return res.data.data;
  },

  async previewVoucher(data: {
    eventId?: string;
    userId?: string;
    items: { price: number; quantity: number }[];
    voucherCode: string;
  }): Promise<VoucherPreviewResponse> {
    const res = await paymentClient.post('/vouchers/preview', data);
    return res.data.data;
  },
};
