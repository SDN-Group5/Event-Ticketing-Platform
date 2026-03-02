import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentAPI } from '../../services/paymentApiService';
import { ROUTES } from '../../constants/routes';

/** Đơn hàng trả về từ API payment (getUserOrders) */
interface OrderItem {
  zoneName: string;
  seatId?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderCode: number;
  eventId: string;
  eventName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'expired' | 'refunded';
  createdAt: string;
  paidAt?: string;
  cancelledAt?: string;
}

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
  expired: 'Hết hạn',
  refunded: 'Đã hoàn tiền',
};

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  processing: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
  expired: 'bg-red-500/20 text-red-400',
  refunded: 'bg-purple-500/20 text-purple-400',
};

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        console.log('[TransactionHistory] user.id =', user.id);
        const data = await PaymentAPI.getUserOrders(user.id);
        console.log('[TransactionHistory] API raw data =', data);
        const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
        console.log('[TransactionHistory] mapped orders length =', list.length);
        if (!cancelled) setOrders(list);
      } catch (err) {
        console.error('Lỗi tải lịch sử giao dịch:', err);
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (!user) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Lịch sử giao dịch</h1>
        <p className="text-gray-400">Xem tất cả đơn hàng và trạng thái thanh toán.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'paid', 'processing', 'pending', 'cancelled', 'expired', 'refunded'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === s ? 'bg-[#8655f6] text-white' : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
            }`}
          >
            {s === 'all' ? 'Tất cả' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#2a2436] rounded-xl">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">receipt_long</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Chưa có giao dịch</h2>
          <p className="text-gray-500 mb-6">
            {filter === 'all' ? 'Bạn chưa có đơn hàng nào.' : `Không có đơn ở trạng thái "${filter === 'all' ? 'Tất cả' : STATUS_LABELS[filter]}".`}
          </p>
          <button
            onClick={() => navigate(ROUTES.SEARCH)}
            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
          >
            Khám phá sự kiện
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-white font-bold">#{order.orderCode}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{order.eventName}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    {order.items.map((item, i) => (
                      <span key={i}>
                        {item.zoneName} × {item.quantity} — {formatVND(item.price * item.quantity)}
                      </span>
                    ))}
                  </div>
                  {order.paidAt && order.status === 'paid' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Thanh toán lúc {new Date(order.paidAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xl font-bold text-white">{formatVND(order.totalAmount)}</span>
                  {order.status === 'paid' && (
                    <button
                      onClick={() => navigate(ROUTES.MY_TICKETS)}
                      className="px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg text-sm transition-colors"
                    >
                      Xem vé
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
