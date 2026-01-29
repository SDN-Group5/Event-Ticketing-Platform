import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const roles: { role: UserRole; label: string; icon: string; description: string }[] = [
        { role: 'customer', label: 'Customer', icon: 'person', description: 'Browse and buy tickets' },
        { role: 'organizer', label: 'Organizer', icon: 'event', description: 'Manage your events' },
        { role: 'admin', label: 'Admin', icon: 'admin_panel_settings', description: 'System administration' },
    ];

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(selectedRole);

        // Navigate based on role
        if (selectedRole === 'customer') navigate('/');
        else if (selectedRole === 'organizer') navigate('/organizer');
        else if (selectedRole === 'admin') navigate('/admin/payouts');
    };

    return (
        <div className="w-full bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-[#8655f6] to-[#d946ef] text-white shadow-lg">
                    <span className="material-symbols-outlined text-2xl">confirmation_number</span>
                </div>
                <h2 className="text-2xl font-bold text-white">TicketVibe</h2>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-slate-400">Select your role and sign in to continue</p>
            </div>

            {/* Role Selection */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-slate-300 mb-3">Select Your Role</label>
                <div className="grid grid-cols-3 gap-3">
                    {roles.map(({ role, label, icon }) => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${selectedRole === role
                                    ? 'bg-[#8655f6]/20 border-[#8655f6] text-white'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-2xl ${selectedRole === role ? 'text-[#8655f6]' : ''}`}>
                                {icon}
                            </span>
                            <span className="text-xs font-medium">{label}</span>
                        </button>
                    ))}
                </div>
                <p className="text-center text-xs text-slate-500 mt-2">
                    {roles.find(r => r.role === selectedRole)?.description}
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#8655f6] focus:ring-2 focus:ring-[#8655f6]/20 transition-all"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#8655f6] focus:ring-2 focus:ring-[#8655f6]/20 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-400">
                        <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-[#8655f6]" />
                        Remember me
                    </label>
                    <button
                        type="button"
                        onClick={() => navigate('/reset-password')}
                        className="text-[#8655f6] hover:underline"
                    >
                        Forgot password?
                    </button>
                </div>

                <Button type="submit" fullWidth size="lg">
                    <span className="material-symbols-outlined">login</span>
                    Sign In as {roles.find(r => r.role === selectedRole)?.label}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-400">
                    Don't have an account?{' '}
                    <button className="text-[#8655f6] hover:underline font-medium">
                        Sign up for free
                    </button>
                </p>
            </div>

            {/* Demo Note */}
            <div className="mt-6 p-4 bg-[#8655f6]/10 border border-[#8655f6]/20 rounded-xl">
                <p className="text-xs text-center text-[#8655f6]">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                    Demo Mode: Just select a role and click Sign In
                </p>
            </div>
        </div>
    );
};
