import React from 'react';

const payoutData = [
    { org: 'Sonic Horizon Events', evt: 'Neon Rave', tickets: 1230, amt: '$8,250', status: 'Pending' },
    { org: 'Dreamlight Collective', evt: 'Electric Dreams Festival', tickets: 890, amt: '$12,400', status: 'Approved' },
    { org: 'Bassline Productions', evt: 'Underground Bass Arena', tickets: 410, amt: '$5,600', status: 'Processing' },
];

export const PayoutsPage: React.FC = () => {
    return (
        <>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black mb-1">Payouts Dashboard</h1>
                    <p className="text-slate-400 font-medium">Manage organizer withdrawals and settlements.</p>
                </div>
                <button className="bg-gradient-to-r from-[#a855f7] to-[#d946ef] px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#a855f7]/30 hover:shadow-[#a855f7]/60 transition-all">
                    Process All
                </button>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Pending', val: '$124,500', color: 'text-[#d946ef]' },
                    { label: 'Processing', val: '$42,000', color: 'text-amber-500' },
                    { label: 'Paid (This Month)', val: '$380,000', color: 'text-emerald-400' },
                    { label: 'Pending Requests', val: '42', color: 'text-slate-300' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700/40">
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">{kpi.label}</p>
                        <p className={`text-3xl font-black ${kpi.color}`}>{kpi.val}</p>
                    </div>
                ))}
            </div>

            {/* Payouts Table */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-black/20 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="text-left py-4 px-6">Organizer</th>
                            <th className="text-left py-4 px-6">Event</th>
                            <th className="text-left py-4 px-6">Tickets Sold</th>
                            <th className="text-left py-4 px-6">Amount</th>
                            <th className="text-left py-4 px-6">Status</th>
                            <th className="text-left py-4 px-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {payoutData.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-700/20 group transition-colors">
                                <td className="py-4 px-6 font-semibold">{row.org}</td>
                                <td className="py-4 px-6 text-slate-400 text-sm">{row.evt}</td>
                                <td className="py-4 px-6 font-mono">{row.tickets}</td>
                                <td className="py-4 px-6 font-bold text-[#d946ef]">{row.amt}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${row.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>{row.status}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="text-[#d946ef] hover:underline text-sm font-bold mr-4">Approve</button>
                                    <button className="text-slate-500 hover:text-slate-300 text-sm font-bold">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
