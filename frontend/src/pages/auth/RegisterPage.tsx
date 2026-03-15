import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');
    const isOrganizerMode = roleParam === 'organizer';
    
    const { isLoading, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationError) setValidationError(null);
        if (error) clearError();
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName.trim()) {
            setValidationError('First name is required');
            return;
        }
        if (!formData.lastName.trim()) {
            setValidationError('Last name is required');
            return;
        }
        if (!formData.email.trim()) {
            setValidationError('Email is required');
            return;
        }
        if (formData.password.length < 6) {
            setValidationError('Password must be at least 6 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        // Call register from AuthContext
        try {
            const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:4001';
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    role: roleParam || 'customer'
                }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                setValidationError(data?.message || 'Registration failed');
                return;
            }

            // Success - redirect to OTP verification
            navigate('/otp', { state: { email: formData.email } });
        } catch (err) {
            console.error(err);
            setValidationError('Cannot connect to server');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
            {/* Concert stage background - pure CSS, no images */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 25%, #1e1029 50%, #251540 75%, #3d1f5c 100%)',
                }}
            />
            {/* Grid backdrop */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: 'linear-gradient(rgba(100, 80, 180, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 80, 180, 0.4) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />
            {/* Central arch */}
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ paddingBottom: '8%' }}>
                <div
                    className="w-[85%] max-w-4xl h-[55vh] max-h-[420px] rounded-t-full relative"
                    style={{
                        background: 'linear-gradient(180deg, rgba(88, 28, 135, 0.85) 0%, rgba(75, 0, 130, 0.9) 50%, rgba(50, 20, 90, 0.95) 100%)',
                        boxShadow: 'inset 0 -80px 120px rgba(251, 146, 60, 0.15), inset 0 0 80px rgba(251, 191, 36, 0.08)',
                    }}
                >
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[45%] rounded-t-full"
                        style={{
                            background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(251, 146, 60, 0.5) 0%, rgba(251, 191, 36, 0.25) 25%, transparent 70%)',
                            filter: 'blur(2px)',
                        }}
                    />
                </div>
            </div>
            {/* Spotlights */}
            <div className="absolute top-0 left-[8%] w-32 h-32 rounded-full opacity-90" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,220,0.6) 25%, transparent 70%)', filter: 'blur(1px)' }} />
            <div className="absolute top-0 right-[8%] w-32 h-32 rounded-full opacity-90" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,220,0.6) 25%, transparent 70%)', filter: 'blur(1px)' }} />
            {/* Subtle dark overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-6 md:p-8">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-[#8655f6] to-[#d946ef] text-white shadow-[0_0_15px_rgba(137,90,246,0.5)]">
                        <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                    </div>
                    <h2
                        className="hidden md:block text-white text-xl font-bold tracking-tight cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        TicketVibe
                    </h2>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-20">
                <div className="w-full backdrop-blur-xl p-8 md:p-10 rounded-3xl max-w-md relative overflow-hidden" style={{
                    background: 'linear-gradient(to bottom, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 70, 0.85) 50%, rgba(30, 20, 50, 0.9) 100%)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(134, 85, 246, 0.15), 0 0 15px rgba(134, 85, 246, 0.08)',
                    border: '1px solid rgba(134, 85, 246, 0.12)',
                }}>
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                        background: 'radial-gradient(ellipse at center, rgba(134, 85, 246, 0.05) 0%, transparent 70%)'
                    }}></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {isOrganizerMode ? 'Organizer Registration' : 'Create Account'}
                            </h1>
                            <p className="text-slate-300 text-sm">
                                {isOrganizerMode 
                                    ? 'Start organizing amazing events with TicketVibe' 
                                    : 'Join TicketVibe and discover amazing events'}
                            </p>
                        </div>

                        {(validationError || error) && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {validationError || error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                        placeholder="John"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                        placeholder="Doe"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                        placeholder="name@example.com"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                        placeholder="Enter password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                        placeholder="Confirm password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showConfirmPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-[#8655f6] to-[#7c3aed] text-white font-bold rounded-xl shadow-lg hover:shadow-[#8655f6]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>

                            <p className="text-center text-slate-400 text-sm mt-6">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-[#a855f7] font-medium hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};