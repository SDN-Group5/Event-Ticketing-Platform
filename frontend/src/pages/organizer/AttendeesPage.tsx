import React, { useState } from 'react';

const attendeesData = [
    { id: '1', name: 'Alex Thompson', email: 'alex@example.com', event: 'Neon Nights Festival', ticketType: 'VIP', date: 'Oct 24', status: 'Checked In' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', event: 'Neon Nights Festival', ticketType: 'General', date: 'Oct 24', status: 'Pending' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', event: 'Bass Drop Party', ticketType: 'VIP', date: 'Nov 05', status: 'Pending' },
    { id: '4', name: 'Emily Davis', email: 'emily@example.com', event: 'Neon Nights Festival', ticketType: 'General', date: 'Oct 24', status: 'Checked In' },
    { id: '5', name: 'Chris Wilson', email: 'chris@example.com', event: 'Acoustic Evening', ticketType: 'VIP', date: 'Nov 20', status: 'Cancelled' },
];

export const AttendeesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEvent, setFilterEvent] = useState('all');

    const filteredAttendees = attendeesData.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesEvent = filterEvent === 'all' || a.event === filterEvent;
        return matchesSearch && matchesEvent;
    });

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">Attendees</h1>
                        <p className="text-slate-400">Manage and track your event attendees</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#8655f6] px-5 py-2.5 rounded-xl font-bold text-white">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Export List
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500"
                        />
                    </div>
                    <select
                        value={filterEvent}
                        onChange={(e) => setFilterEvent(e.target.value)}
                        className="bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white min-w-[200px]"
                    >
                        <option value="all">All Events</option>
                        <option value="Neon Nights Festival">Neon Nights Festival</option>
                        <option value="Bass Drop Party">Bass Drop Party</option>
                        <option value="Acoustic Evening">Acoustic Evening</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Attendees', value: attendeesData.length, icon: 'group', color: 'text-blue-400' },
                        { label: 'Checked In', value: attendeesData.filter(a => a.status === 'Checked In').length, icon: 'check_circle', color: 'text-emerald-400' },
                        { label: 'Pending', value: attendeesData.filter(a => a.status === 'Pending').length, icon: 'schedule', color: 'text-amber-400' },
                        { label: 'Cancelled', value: attendeesData.filter(a => a.status === 'Cancelled').length, icon: 'cancel', color: 'text-rose-400' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-[#1e293b]/60 border border-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-400">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-black/20">
                            <tr className="text-xs text-slate-400 uppercase tracking-wider">
                                <th className="text-left py-4 px-6">Attendee</th>
                                <th className="text-left py-4 px-6">Event</th>
                                <th className="text-left py-4 px-6">Ticket Type</th>
                                <th className="text-left py-4 px-6">Date</th>
                                <th className="text-left py-4 px-6">Status</th>
                                <th className="text-left py-4 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredAttendees.map((attendee) => (
                                <tr key={attendee.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center font-bold text-white text-sm">
                                                {attendee.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{attendee.name}</p>
                                                <p className="text-xs text-slate-400">{attendee.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-300">{attendee.event}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${attendee.ticketType === 'VIP'
                                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                            {attendee.ticketType}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-400">{attendee.date}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${attendee.status === 'Checked In' ? 'bg-emerald-500/10 text-emerald-400' :
                                                attendee.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-rose-500/10 text-rose-400'
                                            }`}>
                                            {attendee.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-2">
                                            {attendee.status === 'Pending' && (
                                                <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                                                    Check In
                                                </button>
                                            )}
                                            <button className="text-slate-400 hover:text-white">
                                                <span className="material-symbols-outlined text-sm">more_vert</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
