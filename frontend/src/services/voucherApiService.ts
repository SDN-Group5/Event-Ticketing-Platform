import axios from 'axios';

const PAYMENT_API =
  (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

const voucherClient = axios.create({
  baseURL: `${PAYMENT_API}/api/payments`,
  headers: { 'Content-Type': 'application/json' },
});

voucherClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface VoucherInput {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  endDate?: string;
  startDate?: string;
  minimumPrice?: number;
  status?: 'active' | 'inactive' | 'expired';
  eventIds?: string[];
  userId?: string;
}

export interface VoucherDTO extends VoucherInput {
  _id: string;
  usedCount: number;
  organizerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const OrganizerVoucherAPI = {
  async listMyVouchers(organizerId: string): Promise<VoucherDTO[]> {
    const res = await voucherClient.get('/organizer/vouchers', {
      params: { organizerId },
    });
    return res.data.data;
  },

  async createVoucher(
    organizerId: string,
    payload: VoucherInput,
  ): Promise<VoucherDTO> {
    const res = await voucherClient.post('/organizer/vouchers', {
      ...payload,
      organizerId,
    });
    return res.data.data;
  },

  async updateVoucher(
    organizerId: string,
    id: string,
    payload: Partial<VoucherInput>,
  ): Promise<VoucherDTO> {
    const res = await voucherClient.put(`/organizer/vouchers/${id}`, {
      ...payload,
      organizerId,
    });
    return res.data.data;
  },

  async deleteVoucher(organizerId: string, id: string): Promise<void> {
    await voucherClient.delete(`/organizer/vouchers/${id}`, {
      data: { organizerId },
    });
  },
};

