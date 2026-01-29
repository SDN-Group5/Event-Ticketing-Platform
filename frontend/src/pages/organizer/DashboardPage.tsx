import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const statsData = [
    { label: 'Total Events', value: '12', icon: 'event', color: 'from-purple-500 to-pink-500' },
    { label: 'Tickets Sold', value: '2,847', icon: 'confirmation_number', color: 'from-blue-500 to-cyan-500' },
    { label: 'Revenue', value: '$45,290', icon: 'payments', color: 'from-emerald-500 to-teal-500' },
    { label: 'Attendees', value: '1,923', icon: 'group', color: 'from-orange-500 to-amber-500' },
];

const upcomingEvents = [
    { id: '1', name: 'Neon Nights Festival', date: 'Oct 24, 2024', ticketsSold: 890, capacity: 1200, status: 'Active' },
    { id: '2', name: 'Bass Drop Party', date: 'Nov 05, 2024', ticketsSold: 245, capacity: 500, status: 'Active' },
    { id: '3', name: 'Acoustic Evening', date: 'Nov 20, 2024', ticketsSold: 0, capacity: 200, status: 'Draft' },
];

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        Welcome back, {user?.name?.split(' ')[0] || 'Organizer'}! 👋
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-[#1e293b]/60 backdrop-blur border border-white/5 rounded-2xl p-5 hover:bg-[#1e293b]/80 transition-colors"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                            <span className="material-symbols-outlined text-white">{stat.icon}</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'View Analytics', icon: 'insights', path: '/organizer/analytics' },
                    { label: 'Manage Attendees', icon: 'group', path: '/organizer/attendees' },
                    { label: 'Create Event', icon: 'add_circle', path: '/organizer/create-event' },
                    { label: 'Settings', icon: 'settings', path: '/organizer' },
                ].map((action) => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col items-center gap-3 p-6 bg-[#1e293b]/40 border border-white/5 rounded-xl hover:bg-[#1e293b]/60 hover:border-[#8655f6]/30 transition-all group"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-[#8655f6] transition-colors">
                            {action.icon}
                        </span>
                        <span className="text-sm font-medium text-slate-300">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Upcoming Events */}
            <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
                    <button
                        onClick={() => navigate('/organizer/create-event')}
                        className="text-[#8655f6] hover:underline text-sm font-medium flex items-center gap-1"
                    >
                        View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
                <div className="divide-y divide-white/5">
                    {upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="p-6 flex items-center gap-6 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-white">event</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-1">{event.name}</h3>
                                <p className="text-sm text-slate-400">{event.date}</p>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="font-bold text-white">{event.ticketsSold} / {event.capacity}</p>
                                <p className="text-xs text-slate-400">Tickets Sold</p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-full"
                                        style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.status === 'Active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                {event.status}
                            </span>
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-slate-400">more_vert</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-4">
                    {[
                        { icon: 'confirmation_number', text: '25 new tickets sold for Neon Nights Festival', time: '2 min ago', color: 'text-emerald-400' },
                        { icon: 'person_add', text: 'New attendee registered: John Doe', time: '15 min ago', color: 'text-blue-400' },
                        { icon: 'edit', text: 'Event "Bass Drop Party" was updated', time: '1 hour ago', color: 'text-amber-400' },
                        { icon: 'check_circle', text: 'Payout of $2,500 completed', time: '3 hours ago', color: 'text-purple-400' },
                    ].map((activity, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <span className={`material-symbols-outlined ${activity.color}`}>{activity.icon}</span>
                            <p className="flex-1 text-slate-300">{activity.text}</p>
                            <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
