import React from 'react';

export const AnalyticsPage: React.FC = () => {

    const revenueData = [
        { month: 'Jan', value: 4500 },
        { month: 'Feb', value: 6200 },
        { month: 'Mar', value: 8100 },
        { month: 'Apr', value: 5800 },
        { month: 'May', value: 9500 },
        { month: 'Jun', value: 12400 },
    ];

    const maxRevenue = Math.max(...revenueData.map(d => d.value));

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
                                <button className="px-3 py-1 bg-[#8655f6]/20 text-[#8655f6] rounded-lg text-sm font-medium">Revenue</button>
                                <button className="px-3 py-1 text-slate-400 hover:bg-white/5 rounded-lg text-sm font-medium">Tickets</button>
                            </div>
                        </div>
                        <div className="flex items-end gap-4 h-64">
                            {revenueData.map((data) => (
                                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#8655f6] to-[#d946ef] rounded-t-lg transition-all hover:opacity-80"
                                        style={{ height: `${(data.value / maxRevenue) * 100}%` }}
                                    />
                                    <span className="text-xs text-slate-400">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ticket Types */}
                    <div className="col-span-4 bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Ticket Distribution</h2>
                        <div className="space-y-4">
                            {[
                                { type: 'General', count: 1523, percentage: 54, color: '#3b82f6' },
                                { type: 'VIP', count: 987, percentage: 35, color: '#8655f6' },
                                { type: 'Backstage', count: 337, percentage: 11, color: '#ec4899' },
                            ].map((ticket) => (
                                <div key={ticket.type}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-slate-300">{ticket.type}</span>
                                        <span className="text-sm font-bold text-white">{ticket.count}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${ticket.percentage}%`, backgroundColor: ticket.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Donut Legend */}
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <div className="flex justify-center gap-6">
                                {[
                                    { label: 'General', color: '#3b82f6' },
                                    { label: 'VIP', color: '#8655f6' },
                                    { label: 'Backstage', color: '#ec4899' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-slate-400">{item.label}</span>
                                    </div>
                                ))}
                            </div>
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
