import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentAPI } from '../../services/paymentApiService';
import { ROUTES } from '../../constants/routes';
import { TicketPopup } from '../../components/ticket/TicketPopup';

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
  row?: string;
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
      let seatNumber: string = item.seatId || '—';
      let row: string | undefined;

      // Chuẩn hoá seatId để hiển thị đẹp trên vé.
      // Hỗ trợ 2 format:
      // - <zoneId>-R{row}-S{seat}
      // - <anything>-{row}-{seat}
      if (item.seatId) {
        let match = item.seatId.match(/-R(\d+)-S(\d+)$/);
        if (!match) {
          match = item.seatId.match(/-(\d+)-(\d+)$/);
        }
        if (match) {
          row = match[1];
          seatNumber = match[2];
        } else if (item.seatId.length > 10) {
          // Fallback: cắt bớt chuỗi cho gọn nếu không đúng pattern
          seatNumber = item.seatId.slice(-6);
        }
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      for (let j = 0; j < qty; j++) {
        list.push({
          id: `${order._id}-${i}-${j}`,
          eventName: order.eventName || 'Sự kiện',
          eventImage: placeholderImg,
          date: dateStr,
          location: order.location || '—',
          zone: item.zoneName || '—',
          seatNumber,
          ticketCode: `TV-${order.orderCode}-${i}${qty > 1 ? `-${j + 1}` : ''}`,
          price: Number(item.price) || 0,
          status: ticketStatus,
          eventId: order.eventId,
          row,
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
  const [popupTicket, setPopupTicket] = useState<Ticket | null>(null);

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
        <>
          <div className="space-y-4">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row p-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-white font-bold text-lg">{ticket.eventName}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          ticket.status,
                        )}`}
                      >
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {new Date(ticket.date).toLocaleDateString('vi-VN')} · {ticket.zone} · Ghế {ticket.seatNumber}
                    </p>
                    <p className="text-gray-500 text-xs font-mono">{ticket.ticketCode}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ticket.status === 'active' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setPopupTicket(ticket)}
                          className="px-4 py-2.5 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">qr_code_2</span>
                          Xem vé
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.REFUND_REQUESTS)}
                          className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                        >
                          Hoàn tiền
                        </button>
                      </>
                    )}
                    {ticket.status === 'used' && (
                      <p className="text-gray-400 text-sm">Vé đã sử dụng</p>
                    )}
                    {ticket.status === 'refunded' && (
                      <p className="text-gray-500 text-sm">Đã hoàn tiền</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <TicketPopup
            isOpen={!!popupTicket}
            onClose={() => setPopupTicket(null)}
            ticket={popupTicket ? {
              id: popupTicket.id,
              eventName: popupTicket.eventName,
              date: popupTicket.date,
              location: popupTicket.location,
              zone: popupTicket.zone,
              seatNumber: popupTicket.seatNumber,
              ticketCode: popupTicket.ticketCode,
              row: popupTicket.row,
            } : null}
          />
        </>
      )}
    </div>
  );
};
