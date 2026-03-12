import React, { useState, useEffect } from 'react';
import { AnalyticsAPI } from '../../services/analyticsApiService';

interface RevenueData {
  month: string;
  value: number;
}

interface TicketData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface TopEvent {
  name: string;
  revenue: string;
  tickets: number;
  rating: number;
}

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  
  // KPI Data
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    activeEvents: 0,
    avgConversion: 0,
    revenueGrowth: 0,
    ticketGrowth: 0,
    conversionTrend: 0
  });

  // Chart Data
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketData[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);

  const fetchAnalytics = async (selectedPeriod: 'month' | 'quarter' | 'year') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AnalyticsAPI.getOverview({ period: selectedPeriod });
      const data = response.data;
      
      // Set KPIs
      setKpis({
        totalRevenue: data.kpi?.totalRevenue || 0,
        ticketsSold: data.kpi?.ticketsSold || 0,
        activeEvents: data.kpi?.activeEvents || 0,
        avgConversion: data.kpi?.avgConversion || 0,
        revenueGrowth: data.revenueGrowth || 0,
        ticketGrowth: data.ticketGrowth || 0,
        conversionTrend: data.conversionTrend || 0
      });

      // Set Revenue Chart Data
      if (data.revenueByMonth && data.revenueByMonth.length > 0) {
        setRevenueData(data.revenueByMonth.map((item: any) => ({
          month: item.month,
          value: item.value
        })));
      } else {
        // Fallback to mock data
        setRevenueData([
          { month: 'Jan', value: 4500 },
          { month: 'Feb', value: 6200 },
          { month: 'Mar', value: 8100 },
          { month: 'Apr', value: 5800 },
          { month: 'May', value: 9500 },
          { month: 'Jun', value: 12400 },
        ]);
      }

      // Set Ticket Types
      if (data.ticketTypeDistribution && data.ticketTypeDistribution.length > 0) {
        setTicketTypes(data.ticketTypeDistribution.map((item: any) => ({
          type: item.type,
          count: item.count,
          percentage: item.percentage,
          color: item.type === 'General' ? '#3b82f6' : item.type === 'VIP' ? '#8655f6' : '#ec4899'
        })));
      } else {
        // Fallback
        setTicketTypes([
          { type: 'General', count: 1523, percentage: 54, color: '#3b82f6' },
          { type: 'VIP', count: 987, percentage: 35, color: '#8655f6' },
          { type: 'Backstage', count: 337, percentage: 11, color: '#ec4899' },
        ]);
      }

      // Set Top Events
      if (data.topEvents && data.topEvents.length > 0) {
        setTopEvents(data.topEvents.map((item: any) => ({
          name: item.name,
          revenue: `$${item.revenue.toLocaleString()}`,
          tickets: item.ticketsSold,
          rating: item.rating
        })));
      } else {
        // Fallback
        setTopEvents([
          { name: 'Neon Nights Festival', revenue: '$18,450', tickets: 890, rating: 4.9 },
          { name: 'Bass Drop Party', revenue: '$12,300', tickets: 560, rating: 4.7 },
          { name: 'Electronic Dreams', revenue: '$9,800', tickets: 340, rating: 4.8 },
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const maxRevenue = Math.max(...revenueData.map(d => d.value), 1);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const blob = await AnalyticsAPI.exportAnalytics(format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to export as ${format}:`, err);
    }
  };

  if (loading) {
    return (
      <div className="pb-20 pt-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
        </div>
      </div>
    );
  }

    return (
        <div className="pb-20 pt-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Analytics</h1>
                        <p className="text-gray-400">Track your event performance and revenue</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <select 
                          value={period}
                          onChange={(e) => setPeriod(e.target.value as 'month' | 'quarter' | 'year')}
                          className="bg-[#2a2436] border border-[#3a3447] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#8655f6]"
                        >
                            <option value="month">Last Month</option>
                            <option value="quarter">Last Quarter</option>
                            <option value="year">Last Year</option>
                        </select>
                        <button 
                          onClick={() => handleExport('csv')}
                          className="flex items-center gap-2 bg-[#2a2436] hover:bg-[#3a3446] border border-[#3a3447] px-4 py-2 rounded-lg text-white text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            Export CSV
                        </button>
                    </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Revenue', value: `$${(kpis.totalRevenue / 1000).toFixed(1)}k`, change: `${kpis.revenueGrowth > 0 ? '+' : ''}${kpis.revenueGrowth.toFixed(1)}%`, icon: 'payments', color: 'from-emerald-500 to-teal-500', positive: kpis.revenueGrowth > 0 },
                        { label: 'Tickets Sold', value: kpis.ticketsSold.toLocaleString(), change: `${kpis.ticketGrowth > 0 ? '+' : ''}${kpis.ticketGrowth.toFixed(1)}%`, icon: 'confirmation_number', color: 'from-blue-500 to-cyan-500', positive: kpis.ticketGrowth > 0 },
                        { label: 'Active Events', value: kpis.activeEvents.toString(), change: '+2', icon: 'event', color: 'from-purple-500 to-pink-500', positive: true },
                        { label: 'Avg. Conversion', value: `${kpis.avgConversion.toFixed(0)}%`, change: `${kpis.conversionTrend > 0 ? '+' : ''}${kpis.conversionTrend.toFixed(1)}%`, icon: 'trending_up', color: 'from-orange-500 to-amber-500', positive: kpis.conversionTrend > 0 },
                    ].map((kpi) => (
                        <div key={kpi.label} className="bg-[#2a2436] rounded-xl p-6 border border-[#3a3447] hover:border-[#8655f6]/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-white">{kpi.icon}</span>
                                </div>
                                <span className={`text-xs font-bold flex items-center gap-1 ${kpi.positive ? 'text-green-400' : 'text-red-400'}`}>
                                    <span className="material-symbols-outlined text-xs">{kpi.positive ? 'trending_up' : 'trending_down'}</span>
                                    {kpi.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
                            <p className="text-sm text-gray-400">{kpi.label}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-[#2a2436] rounded-xl p-6 border border-[#3a3447]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
                        </div>
                        <div className="flex items-end gap-2 h-64">
                            {revenueData.map((data) => {
                                let label = data.month;
                                if (label.length === 10 && label.includes('-')) {
                                    label = label.substring(5); // MM-DD
                                }
                                return (
                                <div key={data.month} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#8655f6] to-[#d946ef] rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                                        style={{ height: `${(data.value / maxRevenue) * 100}%` }}
                                        title={`${data.month}: $${data.value}`}
                                    />
                                    <span className="text-xs text-gray-400 max-w-full overflow-hidden text-ellipsis whitespace-nowrap" title={label}>{label}</span>
                                </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ticket Types */}
                    <div className="bg-[#2a2436] rounded-xl p-6 border border-[#3a3447]">
                        <h2 className="text-xl font-bold text-white mb-6">Ticket Distribution</h2>
                        <div className="space-y-4">
                            {ticketTypes.map((ticket) => (
                                <div key={ticket.type}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-300">{ticket.type}</span>
                                        <span className="text-sm font-bold text-white">{ticket.count}</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#1e1828] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${ticket.percentage}%`, backgroundColor: ticket.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-6 border-t border-[#3a3447]">
                            <div className="flex flex-col gap-2">
                                {ticketTypes.map((item) => (
                                    <div key={item.type} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-gray-400">{item.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Events */}
                <div className="bg-[#2a2436] rounded-xl p-6 border border-[#3a3447]">
                    <h2 className="text-xl font-bold text-white mb-6">Top Performing Events</h2>
                    <div className="space-y-4">
                        {topEvents.map((event, i) => (
                            <div key={event.name} className="flex items-center gap-6 p-4 bg-[#1e1828] rounded-xl hover:bg-[#252030] transition-colors">
                                <span className="text-2xl font-bold text-[#8655f6] w-8">#{i + 1}</span>
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-white text-xl">event</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate">{event.name}</p>
                                    <p className="text-sm text-gray-400">{event.tickets} tickets sold</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-white">{event.revenue}</p>
                                    <div className="flex items-center gap-1 text-yellow-400 justify-end">
                                        <span className="material-symbols-outlined text-sm fill">star</span>
                                        <span className="text-sm">{event.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
