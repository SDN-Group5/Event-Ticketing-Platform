import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizerOrderAPI, Order, Customer, PaginationMeta } from '../../services/orderApiService';
import { useToast } from '../../components/common/ToastProvider';

export const ManageOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'customers'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit] = useState(20);
  const [orderPagination, setOrderPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [customerPage, setCustomerPage] = useState(1);
  const [customerLimit] = useState(50);
  const [customerPagination, setCustomerPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const [orderStatus, setOrderStatus] = useState<string>('');
  const [eventIdFilter, setEventIdFilter] = useState<string>('');

  // Load dữ liệu tùy theo tab
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else {
      loadCustomers();
    }
  }, [activeTab, orderPage, customerPage, orderStatus, eventIdFilter]);

  const loadOrders = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await OrganizerOrderAPI.listOrders(
        orderPage,
        orderLimit,
        eventIdFilter || undefined,
        orderStatus || undefined
      );
      setOrders(result.data);
      setOrderPagination(result.pagination);
    } catch (err) {
      console.error('Error loading orders:', err);
      showToast('Không tải được danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await OrganizerOrderAPI.listCustomers(
        customerPage,
        customerLimit,
        eventIdFilter || undefined
      );
      setCustomers(result.data);
      setCustomerPagination(result.pagination);
    } catch (err) {
      console.error('Error loading customers:', err);
      showToast('Không tải được danh sách khách hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportOrders = async () => {
    if (!user?.id) return;
    try {
      setExporting(true);
      const blob = await OrganizerOrderAPI.exportOrdersCSV(
        eventIdFilter || undefined,
        orderStatus || undefined
      );
      downloadFile(blob, `orders-${new Date().toISOString().split('T')[0]}.csv`);
      showToast('Xuất danh sách đơn hàng thành công', 'success');
    } catch (err) {
      console.error('Error exporting orders:', err);
      showToast('Xuất danh sách thất bại', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCustomers = async () => {
    if (!user?.id) return;
    try {
      setExporting(true);
      const blob = await OrganizerOrderAPI.exportCustomersCSV(eventIdFilter || undefined);
      downloadFile(blob, `customers-${new Date().toISOString().split('T')[0]}.csv`);
      showToast('Xuất danh sách khách hàng thành công', 'success');
    } catch (err) {
      console.error('Error exporting customers:', err);
      showToast('Xuất danh sách thất bại', 'error');
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'refunded':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-400">Theo dõi đơn hàng và danh sách khách hàng của bạn</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab('orders');
              setOrderPage(1);
            }}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'orders'
                ? 'text-[#8655f6]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Danh Sách Đơn Hàng
            {activeTab === 'orders' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8655f6] to-[#d946ef]" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('customers');
              setCustomerPage(1);
            }}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'customers'
                ? 'text-[#8655f6]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Danh Sách Khách Hàng
            {activeTab === 'customers' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8655f6] to-[#d946ef]" />
            )}
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Filters & Export */}
            <div className="flex gap-4 mb-6 flex-wrap items-center">
              <input
                type="text"
                placeholder="Lọc theo sự kiện..."
                value={eventIdFilter}
                onChange={(e) => {
                  setEventIdFilter(e.target.value);
                  setOrderPage(1);
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#8655f6]"
              />
              <select
                value={orderStatus}
                onChange={(e) => {
                  setOrderStatus(e.target.value);
                  setOrderPage(1);
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#8655f6]"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Đang chờ</option>
                <option value="processing">Đang xử lý</option>
                <option value="cancelled">Đã huỷ</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
              <button
                onClick={handleExportOrders}
                disabled={exporting || orders.length === 0}
                className="ml-auto px-4 py-2 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Xuất CSV
              </button>
            </div>

            {/* Orders Table */}
            {loading ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl animate-spin text-[#8655f6] mb-4 block">
                  progress_activity
                </span>
                <p className="text-gray-400">Đang tải...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-5xl text-gray-500 mb-4 block">
                  receipt_long
                </span>
                <p className="text-gray-400">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                      <div>
                        <p className="text-xs text-gray-400">Mã Đơn</p>
                        <p className="font-bold text-lg">#{order.orderCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Sự Kiện</p>
                        <p className="font-semibold truncate">{order.eventName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Số Vé</p>
                        <p className="font-semibold">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Tổng Tiền</p>
                        <p className="font-bold text-emerald-400">{formatVND(order.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Ngày</p>
                        <p className="text-sm">
                          {order.paidAt ? formatDate(order.paidAt) : formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Trạng Thái</p>
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status === 'paid'
                            ? 'Đã thanh toán'
                            : order.status === 'pending'
                            ? 'Đang chờ'
                            : order.status === 'processing'
                            ? 'Đang xử lý'
                            : order.status === 'cancelled'
                            ? 'Đã huỷ'
                            : order.status === 'refunded'
                            ? 'Đã hoàn tiền'
                            : order.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Doanh Thu</p>
                        <p className="font-bold text-[#8655f6]">
                          {formatVND(order.organizerAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {orderPagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setOrderPage(Math.max(1, orderPage - 1))}
                  disabled={orderPage === 1}
                  className="px-4 py-2 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, orderPagination.totalPages) }).map(
                  (_, i) => {
                    const pageNum =
                      orderPage <= 3
                        ? i + 1
                        : i + orderPage - 2;
                    if (pageNum > orderPagination.totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setOrderPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          orderPage === pageNum
                            ? 'bg-gradient-to-r from-[#8655f6] to-[#d946ef]'
                            : 'border border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() =>
                    setOrderPage(Math.min(orderPagination.totalPages, orderPage + 1))
                  }
                  disabled={orderPage === orderPagination.totalPages}
                  className="px-4 py-2 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div>
            {/* Filters & Export */}
            <div className="flex gap-4 mb-6 flex-wrap items-center">
              <input
                type="text"
                placeholder="Lọc theo sự kiện..."
                value={eventIdFilter}
                onChange={(e) => {
                  setEventIdFilter(e.target.value);
                  setCustomerPage(1);
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#8655f6]"
              />
              <button
                onClick={handleExportCustomers}
                disabled={exporting || customers.length === 0}
                className="ml-auto px-4 py-2 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Xuất CSV
              </button>
            </div>

            {/* Customers Grid */}
            {loading ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl animate-spin text-[#8655f6] mb-4 block">
                  progress_activity
                </span>
                <p className="text-gray-400">Đang tải...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-5xl text-gray-500 mb-4 block">
                  people
                </span>
                <p className="text-gray-400">Chưa có khách hàng nào</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {customers.map((customer) => (
                  <div
                    key={customer.userId}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div>
                        <p className="text-xs text-gray-400">Mã Khách</p>
                        <p className="font-mono text-sm truncate">{customer.userId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Số Đơn</p>
                        <p className="font-bold text-lg">{customer.orderCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Tổng Chi Tiêu</p>
                        <p className="font-bold text-emerald-400">
                          {formatVND(customer.totalSpent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Lần Cuối Mua</p>
                        <p className="text-sm">{formatDate(customer.lastOrderDate)}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-400 mb-1">Sự Kiện</p>
                        <div className="flex flex-wrap gap-1">
                          {customer.events.map((event, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-[#8655f6]/20 text-[#8655f6] px-2 py-1 rounded truncate max-w-[150px]"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {customerPagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCustomerPage(Math.max(1, customerPage - 1))}
                  disabled={customerPage === 1}
                  className="px-4 py-2 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, customerPagination.totalPages) }).map(
                  (_, i) => {
                    const pageNum =
                      customerPage <= 3
                        ? i + 1
                        : i + customerPage - 2;
                    if (pageNum > customerPagination.totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCustomerPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          customerPage === pageNum
                            ? 'bg-gradient-to-r from-[#8655f6] to-[#d946ef]'
                            : 'border border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() =>
                    setCustomerPage(
                      Math.min(customerPagination.totalPages, customerPage + 1)
                    )
                  }
                  disabled={customerPage === customerPagination.totalPages}
                  className="px-4 py-2 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
