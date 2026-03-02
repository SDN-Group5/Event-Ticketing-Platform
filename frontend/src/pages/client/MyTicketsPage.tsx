import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentAPI } from '../../services/paymentApiService';
import { ROUTES } from '../../constants/routes';

interface Ticket {
  id: string;
  eventName: string;
  eventImage: string;
  date: string;
  location: string;
  zone: string;
  seatNumber: string;
  ticketCode: string;
  price: number;
  status: 'active' | 'used' | 'refunded' | 'cancelled';
  eventId?: string;
}

type FilterStatus = 'all' | 'active' | 'used' | 'refunded';

const STATUS_LABELS: Record<Ticket['status'], string> = {
  active: 'Chưa sử dụng',
  used: 'Đã sử dụng',
  refunded: 'Đã hoàn tiền',
  cancelled: 'Đã hủy',
};

const FILTER_LABELS: Record<FilterStatus, string> = {
  all: 'Tất cả',
  active: 'Chưa sử dụng',
  used: 'Đã sử dụng',
  refunded: 'Đã hoàn tiền',
};

/** Map order (paid/refunded) + item → Ticket. Một order nhiều item = nhiều vé. */
function ordersToTickets(orders: any[]): Ticket[] {
  const list: Ticket[] = [];
  const placeholderImg = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400';
  for (const order of orders) {
    if (order.status !== 'paid' && order.status !== 'refunded') continue;
    const ticketStatus: Ticket['status'] = order.status === 'refunded' ? 'refunded' : 'active';
    const dateStr = order.paidAt ? new Date(order.paidAt).toISOString().slice(0, 10) : (order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : '');
    const items = order.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const qty = Math.max(1, Number(item.quantity) || 1);
      for (let j = 0; j < qty; j++) {
        list.push({
          id: `${order._id}-${i}-${j}`,
          eventName: order.eventName || 'Sự kiện',
          eventImage: placeholderImg,
          date: dateStr,
          location: order.location || '—',
          zone: item.zoneName || '—',
          seatNumber: item.seatId || '—',
          ticketCode: `TV-${order.orderCode}-${i}${qty > 1 ? `-${j + 1}` : ''}`,
          price: Number(item.price) || 0,
          status: ticketStatus,
          eventId: order.eventId,
        });
      }
    }
  }
  return list.sort((a, b) => (b.date.localeCompare(a.date)));
}

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchTickets = async () => {
      try {
        const data = await PaymentAPI.getUserOrders(user.id);
        const orders = Array.isArray(data) ? data : (data as any)?.data ?? [];
        const mapped = ordersToTickets(orders);
        if (!cancelled) setTickets(mapped);
      } catch (error) {
        console.error('Error fetching tickets from orders:', error);
        if (!cancelled) setTickets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTickets();
    return () => { cancelled = true; };
  }, [user?.id]);

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const getStatusBadgeColor = (status: Ticket['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'used':
        return 'bg-blue-500/20 text-blue-400';
      case 'refunded':
        return 'bg-gray-500/20 text-gray-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'active':
        return 'verified';
      case 'used':
        return 'check_circle';
      case 'refunded':
        return 'undo';
      case 'cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  if (!user) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Lịch sử mua vé</h1>
        <p className="text-gray-400">Xem danh sách vé đã mua và trạng thái sử dụng.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'active', 'used', 'refunded'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
            }`}
          >
            {FILTER_LABELS[status]}
          </button>
        ))}
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">confirmation_number</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Không tìm thấy vé</h2>
          <p className="text-gray-500 mb-6">
            Bạn chưa có vé
            {filter !== 'all' ? ` ở trạng thái "${FILTER_LABELS[filter]}"` : ''}.
          </p>
          <button
            onClick={() => navigate(ROUTES.SEARCH)}
            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
          >
            Mua vé ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.01]"
            >
              <div className="flex flex-col md:flex-row">
                {/* Event Image */}
                <div className="md:w-32 h-32 flex-shrink-0">
                  <img
                    src={ticket.eventImage}
                    alt={ticket.eventName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Ticket Info */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{ticket.eventName}</h3>
                      <div className="flex flex-wrap gap-3 text-gray-400 text-sm mt-2">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {new Date(ticket.date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {ticket.location}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusBadgeColor(
                        ticket.status,
                      )}`}
                    >
                      <span className="material-symbols-outlined text-sm">{getStatusIcon(ticket.status)}</span>
                      {STATUS_LABELS[ticket.status]}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Khu vực</p>
                      <p className="text-white font-semibold">{ticket.zone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Ghế</p>
                      <p className="text-white font-semibold">{ticket.seatNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Giá vé</p>
                      <p className="text-white font-semibold">{ticket.price.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Mã vé</p>
                      <p className="text-white font-mono text-xs">{ticket.ticketCode}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-2 p-4 md:border-l md:border-[#3a3447]">
                  {ticket.status === 'active' && (
                    <>
                      <button className="px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg text-sm transition-colors">
                        Xem QR Code
                      </button>
                      <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
                        Yêu cầu hoàn tiền
                      </button>
                    </>
                  )}
                  {ticket.status === 'used' && (
                    <p className="text-gray-400 text-xs text-center">Vé đã được sử dụng.</p>
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
