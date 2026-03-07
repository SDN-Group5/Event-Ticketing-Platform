import axios from 'axios';

const PAYMENT_API =
  (import.meta as any).env.VITE_PAYMENT_API_URL || 'http://localhost:4004';

const refundClient = axios.create({
  baseURL: `${PAYMENT_API}/api/payments`,
  headers: { 'Content-Type': 'application/json' },
});

refundClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export const RefundAPI = {
  /**
   * Huỷ đơn đã thanh toán để nhận voucher 50% giá trị đơn.
   * Yêu cầu: backend lấy userId từ token hoặc x-user-id.
   */
  async cancelPaidOrderWithVoucher(orderCode: number | string) {
    const res = await refundClient.post(`/cancel-with-voucher/${orderCode}`);
    return res.data;
  },
};

