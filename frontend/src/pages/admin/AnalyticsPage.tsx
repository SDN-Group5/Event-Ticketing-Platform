import React, { useState, useEffect } from 'react';

interface AnalyticsMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export const AdminAnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [loading, setLoading] = useState(true);

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

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">bar_chart</span>
              <p className="text-slate-500 text-sm">Chart placeholder - connect to backend</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">Event Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">pie_chart</span>
              <p className="text-slate-500 text-sm">Chart placeholder - connect to backend</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
