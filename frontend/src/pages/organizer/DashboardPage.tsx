import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDashboardData, DashboardStats, DashboardEvent } from '../../services/dashboardService';
import type { Order } from '../../services/orderApiService';

const formatVND = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const timeAgo = (d: Date | string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
};

const statusBadge = (s: string) => {
    if (s === 'published') return { cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', label: 'Published' };
    if (s === 'completed') return { cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', label: 'Completed' };
    if (s === 'rejected') return { cls: 'bg-red-500/10 text-red-400 border border-red-500/20', label: 'Rejected' };
    return { cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', label: 'Draft' };
};

const orderColor = (s: string) => {
    if (s === 'paid') return 'text-emerald-400';
    if (s === 'refunded') return 'text-amber-400';
    if (s === 'cancelled' || s === 'expired') return 'text-red-400';
    return 'text-blue-400';
};

const orderIcon = (s: string) => {
    if (s === 'paid') return 'check_circle';
    if (s === 'refunded') return 'replay';
    if (s === 'processing') return 'hourglass_top';
    return 'cancel';
};

function buildStatsCards(stats: DashboardStats) {
    return [
        { label: 'Total Events', value: String(stats.totalEvents), icon: 'event', color: 'from-purple-500 to-pink-500' },
        { label: 'Tickets Sold', value: stats.ticketsSold.toLocaleString('vi-VN'), icon: 'confirmation_number', color: 'from-blue-500 to-cyan-500' },
        { label: 'Revenue', value: formatVND(stats.totalRevenue), icon: 'payments', color: 'from-emerald-500 to-teal-500' },
        { label: 'Attendees', value: stats.attendees.toLocaleString('vi-VN'), icon: 'group', color: 'from-orange-500 to-amber-500' },
    ];
}

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({ totalEvents: 0, ticketsSold: 0, totalRevenue: 0, attendees: 0 });
    const [events, setEvents] = useState<DashboardEvent[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const data = await fetchDashboardData();
                if (cancelled) return;
                setStats(data.stats);
                setEvents(data.events);
                setRecentOrders(data.recentOrders);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [user?.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]" />
            </div>
        );
    }

    const statsCards = buildStatsCards(stats);

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        Welcome back, {user?.name?.split(' ')[0] || 'Organizer'}!
                    </h1>
                    <p className="text-slate-400">Here's what's happening with your events</p>
                </div>
                <button
                    onClick={() => navigate('/organizer/create-event')}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#8655f6] to-[#d946ef] px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#8655f6]/30 hover:shadow-[#8655f6]/50 transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Create Event
                </button>
            </div>

            {/* Stats Grid */}
            <StatsGrid cards={statsCards} />

            {/* My Events */}
            <EventList events={events} onViewAll={() => navigate('/organizer/events')} onClickEvent={(id) => navigate(`/organizer/events/${id}`)} />

            {/* Recent Orders */}
            <RecentOrderList orders={recentOrders} />
        </div>
    );
};

/* ──────────── Sub-components ──────────── */

const StatsGrid: React.FC<{ cards: { label: string; value: string; icon: string; color: string }[] }> = ({ cards }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat) => (
            <div key={stat.label} className="bg-[#1e293b]/60 backdrop-blur border border-white/5 rounded-2xl p-5 hover:bg-[#1e293b]/80 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                    <span className="material-symbols-outlined text-white">{stat.icon}</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
        ))}
    </div>
);

const EventList: React.FC<{ events: DashboardEvent[]; onViewAll: () => void; onClickEvent: (id: string) => void }> = ({ events, onViewAll, onClickEvent }) => (
    <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">My Events</h2>
            <button onClick={onViewAll} className="text-[#8655f6] hover:underline text-sm font-medium flex items-center gap-1">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
        </div>

        {events.length === 0 ? (
            <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-600 mb-3">event_busy</span>
                <p className="text-slate-400">Chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!</p>
            </div>
        ) : (
            <div className="divide-y divide-white/5">
                {events.slice(0, 5).map((event) => {
                    const badge = statusBadge(event.status);
                    const pct = event.totalCapacity > 0 ? (event.ticketsSold / event.totalCapacity) * 100 : 0;
                    return (
                        <div key={event.eventId} onClick={() => onClickEvent(event.eventId)} className="p-6 flex items-center gap-6 hover:bg-white/5 transition-colors cursor-pointer">
                            <div
                                className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center bg-cover bg-center shrink-0"
                                style={event.image ? { backgroundImage: `url(${event.image})` } : undefined}
                            >
                                {!event.image && <span className="material-symbols-outlined text-2xl text-white">event</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white mb-1 truncate">{event.name}</h3>
                                <p className="text-sm text-slate-400">
                                    {event.date ? new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Chưa đặt ngày'}
                                </p>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="font-bold text-white">{event.ticketsSold} / {event.totalCapacity}</p>
                                <p className="text-xs text-slate-400">Tickets Sold</p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
);

const RecentOrderList: React.FC<{ orders: Order[] }> = ({ orders }) => (
    <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
        {orders.length === 0 ? (
            <p className="text-slate-500 text-sm">Chưa có đơn hàng nào.</p>
        ) : (
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="flex items-center gap-4">
                        <span className={`material-symbols-outlined ${orderColor(order.status)}`}>{orderIcon(order.status)}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-300 text-sm truncate">
                                <span className="font-semibold text-white">#{order.orderCode}</span> — {order.eventName}
                            </p>
                            <p className="text-xs text-slate-500">
                                {order.items.reduce((s, i) => s + i.quantity, 0)} vé · {formatVND(order.totalAmount)}
                            </p>
                        </div>
                        <span className={`text-xs font-bold uppercase ${orderColor(order.status)}`}>{order.status}</span>
                        <span className="text-xs text-slate-500 hidden sm:block">{timeAgo(order.createdAt)}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);
