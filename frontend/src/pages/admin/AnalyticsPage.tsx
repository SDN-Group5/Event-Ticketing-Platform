import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

interface AnalyticsMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export const AdminAnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'revenue' | 'events'>('revenue');

  // Mock data cho biểu đồ
  const revenueTrendData = [
    { month: 'Jan', revenue: 125000, events: 12 },
    { month: 'Feb', revenue: 185000, events: 15 },
    { month: 'Mar', revenue: 245000, events: 18 },
    { month: 'Apr', revenue: 320000, events: 22 },
    { month: 'May', revenue: 410000, events: 28 },
    { month: 'Jun', revenue: 520000, events: 35 },
  ];

  const eventDistributionData = [
    { name: 'Music', value: 45, color: '#8655f6' },
    { name: 'Sports', value: 28, color: '#3b82f6' },
    { name: 'Theater', value: 15, color: '#ec4899' },
    { name: 'Conference', value: 12, color: '#10b981' },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 3200, newUsers: 450 },
    { month: 'Feb', users: 3650, newUsers: 520 },
    { month: 'Mar', users: 4120, newUsers: 580 },
    { month: 'Apr', users: 4680, newUsers: 640 },
    { month: 'May', users: 5120, newUsers: 720 },
    { month: 'Jun', users: 5340, newUsers: 680 },
  ];

  useEffect(() => {
    // Mock data
    setMetrics([
      {
        label: 'Total Revenue',
        value: '2.5M đ',
        change: 12.5,
        icon: 'trending_up',
      },
      {
        label: 'Total Events',
        value: '156',
        change: 8.2,
        icon: 'event',
      },
      {
        label: 'Total Users',
        value: '5,340',
        change: 15.3,
        icon: 'people',
      },
      {
        label: 'Refund Requests',
        value: '42',
        change: -2.1,
        icon: 'undo',
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-slate-400">Platform-wide metrics and performance indicators</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-[#d946ef]/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
                <p className="text-white font-bold text-2xl">{metric.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#d946ef]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#d946ef]">{metric.icon}</span>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${metric.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span className="material-symbols-outlined text-xs">
                {metric.change > 0 ? 'trending_up' : 'trending_down'}
              </span>
              {Math.abs(metric.change)}% from last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Revenue Trend</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('revenue')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'revenue'
                    ? 'bg-[#8655f6]/20 text-[#8655f6]'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartType('events')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'events'
                    ? 'bg-[#8655f6]/20 text-[#8655f6]'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                Events
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenueAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8655f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEventsAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => {
                    if (chartType === 'revenue') {
                      return `$${(value / 1000).toFixed(0)}k`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => {
                    if (chartType === 'revenue') {
                      return [`$${value.toLocaleString()}`, 'Revenue'];
                    }
                    return [value, 'Events'];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={chartType === 'revenue' ? 'revenue' : 'events'}
                  stroke={chartType === 'revenue' ? '#8655f6' : '#3b82f6'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={chartType === 'revenue' ? 'url(#colorRevenueAdmin)' : 'url(#colorEventsAdmin)'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Distribution Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">Event Distribution</h3>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {eventDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {eventDistributionData.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-300">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">User Growth</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Users']}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8655f6"
                strokeWidth={2}
                dot={{ fill: '#8655f6', r: 4 }}
                name="Total Users"
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
