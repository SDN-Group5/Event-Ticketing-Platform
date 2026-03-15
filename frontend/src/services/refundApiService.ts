import axios from 'axios';

const PAYMENT_API =
  (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

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
   * Backend lấy userId từ: Bearer token (JWT) hoặc header x-user-id.
   * Truyền userId khi đã đăng nhập để tránh 401 khi token hết hạn/secret khác (vd production).
   */
  async cancelPaidOrderWithVoucher(orderCode: number | string, userId?: string) {
    const headers: Record<string, string> = {};
    if (userId) headers['x-user-id'] = userId;
    const res = await refundClient.post(`/cancel-with-voucher/${orderCode}`, null, { headers });
    return res.data;
  },
};

