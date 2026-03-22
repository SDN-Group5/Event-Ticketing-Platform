import React, { useState, useEffect } from 'react';
import {
  fetchAnalyticsData,
  formatVND,
  formatChartY,
  DEFAULT_KPI,
  AnalyticsKPI,
  RevenuePoint,
  TicketTypeItem,
  TopEventItem,
} from '../../services/analyticsService';
import { AnalyticsAPI } from '../../services/analyticsApiService';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  positive: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, change, icon, color, positive }) => (
  <div className="bg-[#2a2436] rounded-xl p-6 border border-[#3a3447] hover:border-[#8655f6]/30 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-white">{icon}</span>
      </div>
      <span className={`text-xs font-bold flex items-center gap-1 ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
        <span className="material-symbols-outlined text-xs">{positive ? 'trending_up' : 'trending_down'}</span>
        {change}
      </span>
    </div>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

interface RevenueChartProps {
  data: RevenuePoint[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl block mb-2">bar_chart</span>
          Chưa có dữ liệu doanh thu
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-64 gap-3">
      {/* Y-Axis */}
      <div className="flex flex-col justify-between items-end text-[10px] text-gray-400 pb-6 w-12 flex-shrink-0">
        {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
          <span key={ratio}>{formatChartY(maxRevenue * ratio)}</span>
        ))}
      </div>

      {/* Bars */}
      <div className="flex-1 relative flex items-end gap-2 h-full">
        {/* Grid lines */}
        <div className="absolute inset-x-0 top-1 bottom-6 flex flex-col justify-between pointer-events-none z-0">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`border-t ${i === 4 ? 'border-[#3a3447]' : 'border-[#3a3447]/50 border-dashed'} w-full h-0`}
            />
          ))}
        </div>

        {data.map((d) => {
          const label = d.month.length === 10 && d.month.includes('-') ? d.month.substring(5) : d.month;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center justify-end gap-2 h-full z-10 min-w-0">
              <div
                className="w-full bg-gradient-to-t from-[#8655f6] to-[#d946ef] rounded-t-lg hover:opacity-80 cursor-pointer transition-opacity min-w-[4px]"
                style={{ height: `calc(${(d.value / maxRevenue) * 100}% - 24px)` }}
                title={`${d.month}: ${formatVND(d.value)}`}
              />
              <span className="text-[10px] text-gray-400 truncate w-full text-center h-4 leading-4" title={label}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TicketDistributionProps {
  items: TicketTypeItem[];
}

const TicketDistribution: React.FC<TicketDistributionProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500">
        <div className="text-center">
          <span className="material-symbols-outlined text-3xl block mb-2">pie_chart</span>
          Chưa có dữ liệu vé
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((t) => (
          <div key={t.type}>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-300">{t.type}</span>
              <span className="text-sm font-bold text-white">{t.count.toLocaleString('vi-VN')}</span>
            </div>
            <div className="w-full h-2 bg-[#1e1828] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${t.percentage}%`, backgroundColor: t.color }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{t.percentage}%</p>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-[#3a3447] flex flex-col gap-2">
        {items.map((t) => (
          <div key={t.type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
            <span className="text-xs text-gray-400">{t.type}</span>
          </div>
        ))}
      </div>
    </>
  );
};

interface TopEventsListProps {
  events: TopEventItem[];
}

const TopEventsList: React.FC<TopEventsListProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl block mb-2">event_busy</span>
          Chưa có sự kiện nào có doanh thu
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((ev, i) => (
        <div
          key={ev.name}
          className="flex items-center gap-6 p-4 bg-[#1e1828] rounded-xl hover:bg-[#252030] transition-colors"
        >
          <span className="text-2xl font-bold text-[#8655f6] w-8">#{i + 1}</span>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white">event</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate">{ev.name}</p>
            <p className="text-sm text-gray-400">{ev.ticketsSold.toLocaleString('vi-VN')} vé đã bán</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-white">{formatVND(ev.revenue)}</p>
            <div className="flex items-center gap-1 text-yellow-400 justify-end">
              <span className="material-symbols-outlined text-sm">star</span>
              <span className="text-sm">{ev.rating}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const [kpis, setKpis] = useState<AnalyticsKPI>(DEFAULT_KPI);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);
  const [topEvents, setTopEvents] = useState<TopEventItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAnalyticsData(period)
      .then(({ kpi, revenueByMonth, ticketTypes: tt, topEvents: te }) => {
        if (cancelled) return;
        setKpis(kpi);
        setRevenueData(revenueByMonth);
        setTicketTypes(tt);
        setTopEvents(te);
      })
      .catch((err) => {
        if (!cancelled) setError('Không thể tải dữ liệu analytics. Vui lòng thử lại.');
        console.error('Analytics error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [period]);

  const handleExportCSV = async () => {
    try {
      const blob = await AnalyticsAPI.exportAnalytics('csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error('Export failed');
    }
  };

  const kpiCards = [
    {
      label: 'Tổng doanh thu',
      value: formatVND(kpis.totalRevenue),
      change: `${kpis.revenueGrowth > 0 ? '+' : ''}${kpis.revenueGrowth.toFixed(1)}%`,
      icon: 'payments',
      color: 'from-emerald-500 to-teal-500',
      positive: kpis.revenueGrowth >= 0,
    },
    {
      label: 'Vé đã bán',
      value: kpis.ticketsSold.toLocaleString('vi-VN'),
      change: `${kpis.ticketGrowth > 0 ? '+' : ''}${kpis.ticketGrowth.toFixed(1)}%`,
      icon: 'confirmation_number',
      color: 'from-blue-500 to-cyan-500',
      positive: kpis.ticketGrowth >= 0,
    },
    {
      label: 'Sự kiện',
      value: kpis.activeEvents.toString(),
      change: `${kpis.activeEvents} tổng`,
      icon: 'event',
      color: 'from-purple-500 to-pink-500',
      positive: true,
    },
    {
      label: 'Tỷ lệ chuyển đổi',
      value: `${kpis.avgConversion.toFixed(0)}%`,
      change: `${kpis.conversionTrend > 0 ? '+' : ''}${kpis.conversionTrend.toFixed(1)}%`,
      icon: 'trending_up',
      color: 'from-orange-500 to-amber-500',
      positive: kpis.conversionTrend >= 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Theo dõi hiệu suất và doanh thu sự kiện</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="bg-[#2a2436] border border-[#3a3447] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#8655f6]"
          >
            <option value="month">Tháng vừa rồi</option>
            <option value="quarter">Quý vừa rồi</option>
            <option value="year">Năm vừa rồi</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#2a2436] hover:bg-[#3a3446] border border-[#3a3447] px-4 py-2 rounded-lg text-white text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((c) => (
          <KPICard key={c.label} {...c} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#2a2436] rounded-xl p-6 border border-[#3a3447]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Doanh thu theo thời gian</h2>
            {revenueData.length > 0 && (
              <span className="text-xs text-gray-500">
                {revenueData.length} kỳ
              </span>
            )}
          </div>
          <RevenueChart data={revenueData} />
        </div>

        {/* Ticket Distribution */}
        <div className="bg-[#2a2436] rounded-xl p-6 border border-[#3a3447]">
          <h2 className="text-xl font-bold text-white mb-6">Phân bổ loại vé</h2>
          <TicketDistribution items={ticketTypes} />
        </div>
      </div>

      {/* Top Events */}
      <div className="bg-[#2a2436] rounded-xl p-6 border border-[#3a3447]">
        <h2 className="text-xl font-bold text-white mb-6">Top sự kiện nổi bật</h2>
        <TopEventsList events={topEvents} />
      </div>
    </div>
  );
};
