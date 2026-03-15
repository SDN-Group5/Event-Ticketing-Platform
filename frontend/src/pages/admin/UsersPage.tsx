import React, { useState, useEffect } from 'react';
import { UserAPI } from '../../services/userApiService';
import { useToast } from '../../components/common/ToastProvider';

export const UsersPage: React.FC = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeRole, setActiveRole] = useState<'customer' | 'organizer' | 'staff'>('customer');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    
    // Edit Modal State
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchUsers = async (page = 1, role = activeRole) => {
        setIsLoading(true);
        try {
            const response = await UserAPI.getUsers({ page, limit: 10, role });
            if (response.success) {
                setUsers(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Failed to load users', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1, activeRole);
    }, [activeRole]);

    const toggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            // Note: userId might be user._id or user.id
            const response = await UserAPI.updateUser(userId, { isActive: !currentStatus });
            if (response.success) {
                showToast(`User ${!currentStatus ? 'activated' : 'banned'} successfully`, 'success');
                setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
            }
        } catch (error: any) {
            console.error('Error updating user status:', error);
            const msg = error.response?.data?.message || 'Failed to update user status';
            showToast(msg, 'error');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        
        setIsUpdating(true);
        try {
            const response = await UserAPI.updateUser(editingUser._id, {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                phone: editingUser.phone,
                role: editingUser.role
            });
            
            if (response.success) {
                showToast('User updated successfully', 'success');
                setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...editingUser } : u));
                setIsEditModalOpen(false);
            }
        } catch (error: any) {
            console.error('Error updating user:', error);
            const msg = error.response?.data?.message || 'Failed to update user information';
            showToast(msg, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const tabs: { id: typeof activeRole; label: string; icon: string }[] = [
        { id: 'customer', label: 'Customers', icon: 'person' },
        { id: 'organizer', label: 'Organizers', icon: 'business_center' },
        { id: 'staff', label: 'Staff members', icon: 'badge' },
    ];

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black mb-1">User Management</h1>
                    <p className="text-slate-400">Manage {activeRole}s and their account status.</p>
                </div>
                <button className="bg-gradient-to-r from-[#a855f7] to-[#d946ef] px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all transform hover:scale-105">
                    Add {activeRole === 'staff' ? 'Staff' : 'User'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 p-1.5 bg-slate-900/50 border border-slate-700/50 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveRole(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                            activeRole === tab.id
                                ? 'bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-slate-400 text-xs uppercase font-black tracking-widest">
                        <tr>
                            <th className="py-5 px-6">User Details</th>
                            <th className="py-5 px-6">Joined Date</th>
                            <th className="py-5 px-6">Status</th>
                            <th className="py-5 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 font-medium">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="py-32 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                                        <p className="animate-pulse text-slate-400 font-bold tracking-widest uppercase text-xs">Fetching users...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <span className="material-symbols-outlined text-5xl">person_off</span>
                                        <p className="font-bold">No {activeRole}s found in database.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-700/20 transition-all duration-200 group">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a855f7]/20 to-[#d946ef]/20 border border-white/5 flex items-center justify-center font-black text-purple-400 uppercase text-lg group-hover:scale-110 transition-transform">
                                                {user.firstName?.substring(0, 1)}{user.lastName?.substring(0, 1)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-slate-400 font-mono text-sm">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
                                            <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                                                user.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>{user.isActive ? 'Active' : 'Banned'}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setEditingUser({...user}); setIsEditModalOpen(true); }}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-600 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => toggleStatus(user._id, user.isActive)}
                                                className={`px-4 h-9 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all ${
                                                    user.isActive 
                                                        ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' 
                                                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                                }`}
                                            >
                                                {user.isActive ? 'Ban' : 'Unban'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => fetchUsers(page)}
                            className={`w-11 h-11 rounded-2xl font-black transition-all transform hover:scale-110 ${
                                pagination.page === page 
                                    ? 'bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white shadow-xl shadow-purple-500/30' 
                                    : 'bg-slate-800/80 text-slate-500 hover:bg-slate-700 hover:text-slate-200'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-black mb-1">Edit User Profile</h2>
                            <p className="text-slate-400 text-sm mb-6">Updating information for {editingUser?.email}</p>
                            
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                                        <input 
                                            type="text" 
                                            value={editingUser?.firstName || ''}
                                            onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={editingUser?.lastName || ''}
                                            onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={editingUser?.phone || ''}
                                        onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Role</label>
                                    <select 
                                        value={editingUser?.role || ''}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="organizer">Organizer</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all disabled:opacity-50"
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

