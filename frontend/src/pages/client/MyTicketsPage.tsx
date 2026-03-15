import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentAPI } from '../../services/paymentApiService';
import { RefundAPI } from '../../services/refundApiService';
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
  refunded: 'Đã huỷ (voucher 50%)',
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
          // If Row is 1, it's likely a standing zone or single-row zone
          // For standing zones, we prefer to show just the seat number (Spot)
          if (row === '1' && (item.zoneName || '').toLowerCase().includes('standing')) {
            row = undefined;
            seatNumber = `S${seatNumber}`;
          }
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
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [cancelTicketTarget, setCancelTicketTarget] = useState<Ticket | null>(null);
  const [agreeNoRefund, setAgreeNoRefund] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showVoucherBanner, setShowVoucherBanner] = useState(false);

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

  const canConfirmCancel =
    !!cancelTicketTarget && agreeNoRefund && agreePrivacy && !cancelLoading;

  const resetCancelModal = () => {
    setCancelTicketTarget(null);
    setAgreeNoRefund(false);
    setAgreePrivacy(false);
    setCancelLoading(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTicketTarget || !user?.id) return;

    // Lấy orderCode từ ticketCode: TV-{orderCode}-{index}
    const match = cancelTicketTarget.ticketCode.match(/^TV-(\d+)-/);
    const orderCode = match ? match[1] : null;
    if (!orderCode) {
      alert('Không xác định được đơn hàng để huỷ.');
      return;
    }
    try {
      setCancelLoading(cancelTicketTarget.id);
      const res = await RefundAPI.cancelPaidOrderWithVoucher(orderCode, user.id);
      console.log('cancel-with-voucher result', res);
      setShowVoucherBanner(true);
      // Reload lịch sử vé để cập nhật trạng thái
      const data = await PaymentAPI.getUserOrders(user.id);
      const orders = Array.isArray(data) ? data : (data as any)?.data ?? [];
      const mapped = ordersToTickets(orders);
      setTickets(mapped);
      resetCancelModal();
    } catch (err: any) {
      console.error('Error cancel ticket with voucher:', err?.response?.data ?? err);
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Huỷ vé thất bại, vui lòng thử lại.';
      if (status === 401) {
        alert('Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.\n\n' + msg);
        resetCancelModal();
        navigate(ROUTES.LOGIN);
        return;
      }
      if (status === 400) {
        alert(msg + '\n\nDanh sách vé sẽ được cập nhật.');
        resetCancelModal();
        setCancelLoading(null);
        // Reload danh sách để đồng bộ trạng thái (vd đơn đã huỷ trước đó)
        try {
          const data = await PaymentAPI.getUserOrders(user.id);
          const orders = Array.isArray(data) ? data : (data as any)?.data ?? [];
          setTickets(ordersToTickets(orders));
        } catch (_) {}
        return;
      }
      alert(msg);
      setCancelLoading(null);
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

      {/* Voucher Banner */}
      {showVoucherBanner && (
        <div className="mb-6 bg-gradient-to-r from-[#8655f6]/20 to-[#d946ef]/20 border border-[#8655f6]/40 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8655f6]/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#d946ef]">redeem</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Huỷ vé thành công!</p>
            <p className="text-gray-300 text-xs mt-0.5">Voucher giảm 50% giá trị đơn hàng đã được cấp cho tài khoản của bạn.</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.MY_VOUCHERS)}
            className="px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">redeem</span>
            Xem Voucher
          </button>
          <button onClick={() => setShowVoucherBanner(false)} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

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
                          onClick={() => {
                            setCancelTicketTarget(ticket);
                            setAgreeNoRefund(false);
                            setAgreePrivacy(false);
                          }}
                          className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={cancelLoading === ticket.id}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {cancelLoading === ticket.id ? 'hourglass_top' : 'redeem'}
                          </span>
                          {cancelLoading === ticket.id ? 'Đang huỷ...' : 'Huỷ vé (nhận voucher)'}
                        </button>
                      </>
                    )}
                    {ticket.status === 'used' && (
                      <p className="text-gray-400 text-sm">Vé đã sử dụng</p>
                    )}
                    {ticket.status === 'refunded' && (
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.MY_VOUCHERS)}
                        className="px-4 py-2.5 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#a78bfa] rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">redeem</span>
                        Xem Voucher
                      </button>
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

          {/* Huỷ vé + voucher confirm modal */}
          {cancelTicketTarget && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
              <div className="bg-[#1e1828] border border-[#3a3447] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-[#3a3447] flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Xác nhận huỷ vé (nhận voucher)
                    </h2>
                    <p className="text-xs text-gray-400">
                      Vui lòng đọc kỹ chính sách trước khi tiếp tục. Sau khi huỷ sẽ không thể
                      khôi phục vé.
                    </p>
                  </div>
                  <button
                    onClick={resetCancelModal}
                    className="p-1 rounded-full hover:bg-white/10 text-gray-400"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <div className="p-5 space-y-4 text-sm text-gray-200">
                  <div className="bg-[#261b3a] rounded-xl p-4 border border-[#3a3447]">
                    <p className="font-semibold text-white mb-2">
                      Vé: {cancelTicketTarget.eventName}
                    </p>
                    <p className="text-xs text-gray-400 mb-1">
                      Ghế {cancelTicketTarget.zone} · Ghế {cancelTicketTarget.seatNumber}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Mã vé: {cancelTicketTarget.ticketCode}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-gray-300">
                    <p className="font-semibold text-white">Lưu ý huỷ vé:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Sau khi huỷ, <span className="font-semibold">vé sẽ mất hiệu lực vĩnh viễn</span>{' '}
                        và không thể khôi phục.
                      </li>
                      <li>
                        Bạn <span className="font-semibold">không được hoàn tiền</span>. Hệ thống sẽ
                        cấp <span className="font-semibold">1 voucher giảm giá 50% giá trị đơn</span>{' '}
                        (sử dụng trong 30 ngày).
                      </li>
                      <li>
                        Ghế của bạn sẽ được trả về trạng thái trống để người khác có thể mua lại.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 text-xs text-gray-300">
                    <p className="font-semibold text-white">
                      Chính sách bảo mật & xử lý dữ liệu khách hàng:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Thông tin cá nhân và lịch sử giao dịch của bạn được sử dụng để cấp voucher và
                        quản lý đơn hàng theo quy định.
                      </li>
                      <li>
                        Chúng tôi không chia sẻ dữ liệu cá nhân cho bên thứ ba ngoài các đối tác thanh
                        toán/đối tác tổ chức sự kiện liên quan.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#3a3447]">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeNoRefund}
                        onChange={(e) => setAgreeNoRefund(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-500 bg-transparent"
                      />
                      <span>
                        Tôi hiểu rằng <span className="font-semibold">hệ thống sẽ không hoàn tiền</span> và
                        chỉ cấp voucher 50% giá trị đơn hàng.
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-500 bg-transparent"
                      />
                      <span>
                        Tôi đồng ý với việc xử lý dữ liệu cá nhân theo{' '}
                        <span className="font-semibold">chính sách bảo mật thông tin khách hàng</span>.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="p-5 border-t border-[#3a3447] flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={resetCancelModal}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#3a3447] text-gray-200 hover:bg-[#4a3e5a]"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={!canConfirmCancel}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                      canConfirmCancel
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-red-500/40 text-red-200 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {cancelLoading === cancelTicketTarget.id ? 'hourglass_top' : 'redeem'}
                    </span>
                    {cancelLoading === cancelTicketTarget.id
                      ? 'Đang huỷ...'
                      : 'Xác nhận huỷ vé & nhận voucher'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
