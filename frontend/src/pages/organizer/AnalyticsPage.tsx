import React, { useState } from 'react';
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
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
    const [chartType, setChartType] = useState<'revenue' | 'tickets'>('revenue');

    const revenueData = [
        { month: 'Jan', revenue: 4500, tickets: 320 },
        { month: 'Feb', revenue: 6200, tickets: 445 },
        { month: 'Mar', revenue: 8100, tickets: 580 },
        { month: 'Apr', revenue: 5800, tickets: 410 },
        { month: 'May', revenue: 9500, tickets: 680 },
        { month: 'Jun', revenue: 12400, tickets: 890 },
    ];

    const ticketDistributionData = [
        { name: 'General', value: 1523, color: '#3b82f6' },
        { name: 'VIP', value: 987, color: '#8655f6' },
        { name: 'Backstage', value: 337, color: '#ec4899' },
    ];

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">Analytics</h1>
                        <p className="text-slate-400">Track your event performance and revenue</p>
                    </div>
                    <div className="flex gap-3">
                        <select className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-white text-sm">
                            <option>Last 6 Months</option>
                            <option>Last 12 Months</option>
                            <option>This Year</option>
                        </select>
                        <button className="flex items-center gap-2 bg-[#1e293b] border border-slate-700 px-4 py-2 rounded-lg text-white text-sm">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Export
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Revenue', value: '$45,290', change: '+12.5%', icon: 'payments', color: 'from-emerald-500 to-teal-500', positive: true },
                        { label: 'Tickets Sold', value: '2,847', change: '+8.2%', icon: 'confirmation_number', color: 'from-blue-500 to-cyan-500', positive: true },
                        { label: 'Active Events', value: '12', change: '+2', icon: 'event', color: 'from-purple-500 to-pink-500', positive: true },
                        { label: 'Avg. Conversion', value: '68%', change: '-2.1%', icon: 'trending_up', color: 'from-orange-500 to-amber-500', positive: false },
                    ].map((kpi) => (
                        <div key={kpi.label} className="bg-[#1e293b]/60 backdrop-blur border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-white">{kpi.icon}</span>
                                </div>
                                <span className={`text-xs font-bold flex items-center gap-1 ${kpi.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <span className="material-symbols-outlined text-xs">{kpi.positive ? 'trending_up' : 'trending_down'}</span>
                                    {kpi.change}
                                </span>
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{kpi.value}</p>
                            <p className="text-sm text-slate-400">{kpi.label}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="col-span-8 bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
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
                                    onClick={() => setChartType('tickets')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                        chartType === 'tickets'
                                            ? 'bg-[#8655f6]/20 text-[#8655f6]'
                                            : 'text-slate-400 hover:bg-white/5'
                                    }`}
                                >
                                    Tickets
                                </button>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8655f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
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
                                                return `$${(value / 1000).toFixed(1)}k`;
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
                                                return [`$${value.toLocaleString()}`, chartType === 'revenue' ? 'Revenue' : 'Tickets'];
                                            }
                                            return [value, 'Tickets'];
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey={chartType === 'revenue' ? 'revenue' : 'tickets'}
                                        stroke={chartType === 'revenue' ? '#8655f6' : '#3b82f6'}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill={chartType === 'revenue' ? 'url(#colorRevenue)' : 'url(#colorTickets)'}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Ticket Types */}
                    <div className="col-span-4 bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Ticket Distribution</h2>
                        <div className="h-48 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ticketDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {ticketDistributionData.map((entry, index) => (
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
                                        formatter={(value: number) => [value, 'Tickets']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3">
                            {ticketDistributionData.map((ticket) => {
                                const total = ticketDistributionData.reduce((sum, t) => sum + t.value, 0);
                                const percentage = Math.round((ticket.value / total) * 100);
                                return (
                                    <div key={ticket.name}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: ticket.color }}
                                                />
                                                <span className="text-sm text-slate-300">{ticket.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white">{ticket.value}</span>
                                                <span className="text-xs text-slate-400">({percentage}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${percentage}%`, backgroundColor: ticket.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Top Events */}
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Top Performing Events</h2>
                    <div className="space-y-4">
                        {[
                            { name: 'Neon Nights Festival', revenue: '$18,450', tickets: 890, rating: 4.9 },
                            { name: 'Bass Drop Party', revenue: '$12,300', tickets: 560, rating: 4.7 },
                            { name: 'Electronic Dreams', revenue: '$9,800', tickets: 340, rating: 4.8 },
                        ].map((event, i) => (
                            <div key={event.name} className="flex items-center gap-6 p-4 bg-white/5 rounded-xl">
                                <span className="text-2xl font-black text-slate-500 w-8">#{i + 1}</span>
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white">event</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white">{event.name}</p>
                                    <p className="text-sm text-slate-400">{event.tickets} tickets sold</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-white">{event.revenue}</p>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <span className="material-symbols-outlined text-sm filled">star</span>
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
