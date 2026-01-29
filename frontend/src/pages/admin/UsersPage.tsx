import React from 'react';

const usersData = [
    { name: 'Alex Thompson', email: 'alex@ex.com', role: 'Organizer', events: 12, status: 'Active' },
    { name: 'Sophia Chen', email: 'sophia@ex.com', role: 'Organizer', events: 8, status: 'Active' },
    { name: 'Michael Davis', email: 'michael@ex.com', role: 'Admin', events: 0, status: 'Active' },
    { name: 'Sarah Martinez', email: 'sarah@ex.com', role: 'Organizer', events: 3, status: 'Banned' },
];

export const UsersPage: React.FC = () => {
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black mb-1">User Management</h1>
                    <p className="text-slate-400">Manage organizers and administrators.</p>
                </div>
                <button className="bg-gradient-to-r from-[#a855f7] to-[#d946ef] px-6 py-3 rounded-xl font-bold">
                    Add User
                </button>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-black/20 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="text-left py-4 px-6">User</th>
                            <th className="text-left py-4 px-6">Role</th>
                            <th className="text-left py-4 px-6">Events</th>
                            <th className="text-left py-4 px-6">Status</th>
                            <th className="text-left py-4 px-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {usersData.map((user, i) => (
                            <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#d946ef] flex items-center justify-center font-bold text-sm">
                                            {user.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${user.role === 'Admin' ? 'bg-[#d946ef]/20 text-[#d946ef]' : 'bg-blue-500/10 text-blue-400'
                                        }`}>{user.role}</span>
                                </td>
                                <td className="py-4 px-6 font-mono">{user.events}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>{user.status}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="text-slate-400 hover:text-white mr-2">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button className={`text-sm font-bold ${user.status === 'Active' ? 'text-rose-500' : 'text-emerald-400'}`}>
                                        {user.status === 'Active' ? 'Ban' : 'Unban'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
