import React, { useState, useEffect } from 'react';
import {
  fetchAdminAnalytics,
  formatVND,
  formatChartY,
  formatDateLabel,
  DEFAULT_ADMIN_KPI,
  AdminKPI,
  RevenuePoint,
  TopEventItem,
  AdminAnalyticsData,
} from '../../services/adminAnalyticsService';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, sub, icon, iconColor, iconBg }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-[#d946ef]/40 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <div className="min-w-0 flex-1">
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-white font-bold text-2xl truncate">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 ml-3`}>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
    </div>
  </div>
);

interface RevenueChartProps {
  data: RevenuePoint[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-slate-600">
        <span className="material-symbols-outlined text-5xl mb-2">bar_chart</span>
        <p className="text-sm">Chưa có dữ liệu doanh thu</p>
      </div>
    );
  }

  return (
    <div className="flex h-56 gap-2 mt-4">
      {/* Y-Axis */}
      <div className="flex flex-col justify-between items-end text-[10px] text-slate-500 pb-6 w-12 flex-shrink-0">
        {[1, 0.75, 0.5, 0.25, 0].map((r) => (
          <span key={r}>{formatChartY(maxRevenue * r)}</span>
        ))}
      </div>

      {/* Bars */}
      <div className="flex-1 relative flex items-end gap-1 h-full">
        {/* Grid lines */}
        <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-slate-700/50 border-dashed w-full" />
          ))}
        </div>

        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 h-full z-10 min-w-0">
            <div
              className="w-full bg-gradient-to-t from-[#d946ef] to-[#8655f6] rounded-t hover:opacity-80 cursor-pointer transition-opacity"
              style={{ height: `calc(${(d.revenue / maxRevenue) * 100}% - 24px)`, minHeight: '2px' }}
              title={`${d.date}: ${formatVND(d.revenue)} — ${d.orders} đơn`}
            />
            <span className="text-[10px] text-slate-500 truncate w-full text-center h-4 leading-4">
              {formatDateLabel(d.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TopEventsTableProps {
  events: TopEventItem[];
}

const TopEventsTable: React.FC<TopEventsTableProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-600">
        <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
        <p className="text-sm">Chưa có dữ liệu sự kiện</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...events.map((e) => e.revenue), 1);

  return (
    <div className="space-y-3">
      {events.map((ev, i) => (
        <div key={ev.eventId} className="flex items-center gap-4 group">
          <span className="text-lg font-bold text-[#d946ef] w-6 flex-shrink-0">#{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-white truncate pr-2">{ev.eventName}</p>
              <p className="text-sm font-bold text-white flex-shrink-0">{formatVND(ev.revenue)}</p>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-full"
                style={{ width: `${(ev.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{ev.ticketsSold.toLocaleString('vi-VN')} vé · {ev.orderCount} đơn</p>
          </div>
        </div>
      ))}
    </div>
  );
};

interface OrderStatusChartProps {
  data: Record<string, number>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid:        { label: 'Đã thanh toán', color: '#10b981' },
  pending:     { label: 'Chờ thanh toán', color: '#f59e0b' },
  cancelled:   { label: 'Đã hủy',        color: '#ef4444' },
  refunded:    { label: 'Hoàn tiền',     color: '#8655f6' },
  expired:     { label: 'Hết hạn',       color: '#64748b' },
  processing:  { label: 'Đang xử lý',   color: '#3b82f6' },
};

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-600">
        <span className="material-symbols-outlined text-4xl mb-2">pie_chart</span>
        <p className="text-sm">Chưa có đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([status, count]) => {
        const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#64748b' };
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
        return (
          <div key={status}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">{cfg.label}</span>
              <span className="font-bold text-white">{count.toLocaleString('vi-VN')}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: cfg.color }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{pct}%</p>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminAnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminAnalyticsData>({
    kpi: DEFAULT_ADMIN_KPI,
    revenueByTime: [],
    topEvents: [],
    topOrganizers: [],
    ordersByStatus: {},
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdminAnalytics(period)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError('Không thể tải dữ liệu analytics. Vui lòng thử lại.');
        console.error('Admin analytics error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [period]);

  const { kpi, revenueByTime, topEvents, ordersByStatus } = data;

  const kpiCards: KPICardProps[] = [
    {
      label: 'Tổng doanh thu',
      value: formatVND(kpi.totalRevenue),
      sub: `Hoa hồng: ${formatVND(kpi.totalCommission)}`,
      icon: 'payments',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Vé đã bán',
      value: kpi.ticketsSold.toLocaleString('vi-VN'),
      sub: `${kpi.totalOrders.toLocaleString('vi-VN')} đơn hàng`,
      icon: 'confirmation_number',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Sự kiện',
      value: kpi.totalEvents.toLocaleString('vi-VN'),
      sub: 'Có đơn đã thanh toán',
      icon: 'event',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
    },
    {
      label: 'Người dùng',
      value: kpi.totalUsers > 0 ? kpi.totalUsers.toLocaleString('vi-VN') : '—',
      sub: 'Tổng tài khoản',
      icon: 'people',
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10',
    },
    {
      label: 'Hủy / Hoàn tiền',
      value: kpi.refundRequests.toLocaleString('vi-VN'),
      sub: 'Trong kỳ',
      icon: 'undo',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
    },
    {
      label: 'Doanh thu tất cả thời gian',
      value: formatVND(kpi.allTimeRevenue),
      sub: `${kpi.allTimeTickets.toLocaleString('vi-VN')} vé tổng`,
      icon: 'bar_chart',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d946ef]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-slate-400">Thống kê toàn nền tảng — dữ liệu thực tế</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#d946ef]"
        >
          <option value="month">Tháng vừa rồi</option>
          <option value="quarter">Quý vừa rồi</option>
          <option value="year">Năm vừa rồi</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((c) => (
          <KPICard key={c.label} {...c} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold">Doanh thu theo thời gian</h3>
            {revenueByTime.length > 0 && (
              <span className="text-xs text-slate-500">{revenueByTime.length} điểm dữ liệu</span>
            )}
          </div>
          <RevenueChart data={revenueByTime} />
        </div>

        {/* Order Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">Phân bổ đơn hàng</h3>
          <OrderStatusChart data={ordersByStatus} />
        </div>
      </div>

      {/* Top Events */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold mb-6">Top sự kiện doanh thu cao nhất</h3>
        <TopEventsTable events={topEvents} />
      </div>
    </div>
  );
};
