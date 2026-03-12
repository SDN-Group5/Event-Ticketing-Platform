import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

const orderClient = axios.create({
  baseURL: `${API_URL}/api/payments`,
  headers: { 'Content-Type': 'application/json' },
});

orderClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Order {
  _id: string;
  orderCode: number;
  userId: string;
  customerName?: string;
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
  subtotal: number;
  commissionAmount: number;
  organizerAmount: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'expired' | 'refunded';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  userId: string;
  customerName?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: Date;
  events: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const OrganizerOrderAPI = {
  /**
   * Lấy danh sách đơn hàng của organizer
   * @param page - Trang (mặc định: 1)
   * @param limit - Số item trên trang (mặc định: 20)
   * @param eventId - Lọc theo sự kiện (tùy chọn)
   * @param status - Lọc theo trạng thái (tùy chọn)
   */
  async listOrders(
    page: number = 1,
    limit: number = 20,
    eventId?: string,
    status?: string
  ): Promise<{ data: Order[]; pagination: PaginationMeta }> {
    const params: any = { page, limit };
    if (eventId) params.eventId = eventId;
    if (status) params.status = status;

    const res = await orderClient.get('/organizer/orders', { params });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  /**
   * Lấy danh sách khách hàng của organizer
   * @param page - Trang (mặc định: 1)
   * @param limit - Số item trên trang (mặc định: 50)
   * @param eventId - Lọc theo sự kiện (tùy chọn)
   */
  async listCustomers(
    page: number = 1,
    limit: number = 50,
    eventId?: string
  ): Promise<{ data: Customer[]; pagination: PaginationMeta }> {
    const params: any = { page, limit };
    if (eventId) params.eventId = eventId;

    const res = await orderClient.get('/organizer/customers', { params });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  /**
   * Xuất danh sách khách hàng ra CSV
   */
  async exportCustomersCSV(eventId?: string): Promise<Blob> {
    const params: any = { limit: 10000 };
    if (eventId) params.eventId = eventId;

    const res = await orderClient.get('/organizer/customers', {
      params,
      responseType: 'json',
    });

    const customers: Customer[] = res.data.data;

    // Tạo CSV content
    const headers = ['Mã Khách', 'Tên Khách', 'Số Đơn', 'Tổng Chi Tiêu', 'Lần Cuối Mua', 'Sự Kiện'];
    const rows = customers.map((c) => [
      c.userId,
      c.customerName || 'N/A',
      c.orderCount,
      c.totalSpent.toLocaleString('vi-VN'),
      new Date(c.lastOrderDate).toLocaleDateString('vi-VN'),
      c.events.join('; '),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  },

  /**
   * Xuất danh sách đơn hàng ra CSV
   */
  async exportOrdersCSV(eventId?: string, status?: string): Promise<Blob> {
    const params: any = { limit: 10000 };
    if (eventId) params.eventId = eventId;
    if (status) params.status = status;

    const res = await orderClient.get('/organizer/orders', {
      params,
      responseType: 'json',
    });

    const orders: Order[] = res.data.data;

    // Tạo CSV content
    const headers = ['Mã Đơn', 'Mã Khách', 'Tên Khách', 'Sự Kiện', 'Số Vé', 'Tổng Tiền', 'Trạng Thái', 'Ngày Thanh Toán'];
    const rows = orders.map((o) => [
      o.orderCode,
      o.userId,
      o.customerName || 'N/A',
      o.eventName,
      o.items.reduce((sum, item) => sum + item.quantity, 0),
      o.totalAmount.toLocaleString('vi-VN'),
      o.status,
      o.paidAt ? new Date(o.paidAt).toLocaleDateString('vi-VN') : 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  },
};
