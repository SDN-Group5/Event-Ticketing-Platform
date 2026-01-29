import React from 'react';

const eventQueue = [
    { name: 'Cyberpunk Warehouse Party', org: 'Techno Addict', date: 'Oct 25', status: 'New', image: 'https://picsum.photos/100/100?random=1' },
    { name: 'Jazz Under the Stars', org: 'Moonlight Events', date: 'Nov 01', status: 'Under Review', image: 'https://picsum.photos/100/100?random=2' },
    { name: 'Global Dance Championship', org: 'Dance Crew Inc.', date: 'Nov 10', status: 'New', image: 'https://picsum.photos/100/100?random=3' },
];

export const EventQueuePage: React.FC = () => {
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black mb-1">Event Approval Queue</h1>
                    <p className="text-slate-400">Review and approve new event submissions.</p>
                </div>
                <div className="flex gap-4 text-sm font-bold">
                    <span className="flex items-center gap-2 text-slate-400">
                        <span className="w-2 h-2 bg-amber-500 rounded-full" /> 8 Pending
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {eventQueue.map((event, i) => (
                    <div
                        key={i}
                        className="bg-[#0f1219] border border-slate-800 rounded-xl p-6 flex gap-6 items-center hover:border-slate-700 transition-colors"
                    >
                        <img src={event.image} alt={event.name} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1">
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${event.status === 'New' ? 'text-amber-500' : 'text-blue-400'}`}>
                                {event.status}
                            </p>
                            <h3 className="text-xl font-bold text-white">{event.name}</h3>
                            <p className="text-sm text-slate-400">by {event.org} • {event.date}</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-5 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold text-sm hover:bg-emerald-500/20">
                                Approve
                            </button>
                            <button className="px-5 py-2 bg-slate-700/50 text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-700">
                                Review
                            </button>
                            <button className="px-4 py-2 text-rose-500 hover:text-rose-400 font-bold text-sm">
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
