import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = await login(email, password);
        if (!user) return;

        // Redirect dựa trên role từ database (không thể tự chuyển đổi)
        switch (user.role) {
            case 'admin':
                navigate('/admin/payouts');
                break;
            case 'organizer':
                navigate('/organizer');
                break;
            case 'staff':
                // Staff có thể làm việc với organizer hoặc có route riêng
                navigate('/organizer');
                break;
            case 'customer':
            default:
                navigate('/');
                break;
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
            {/* Concert stage background - pure CSS, no images */}
            {/* Base: dark purple-blue gradient */}
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
            {/* Central arch - purple with inner golden glow */}
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
            {/* Spotlights - top corners */}
            <div className="absolute top-0 left-[8%] w-32 h-32 rounded-full opacity-90" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,220,0.6) 25%, transparent 70%)', filter: 'blur(1px)' }} />
            <div className="absolute top-0 right-[8%] w-32 h-32 rounded-full opacity-90" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,220,0.6) 25%, transparent 70%)', filter: 'blur(1px)' }} />
            {/* Light beams */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(165deg, transparent 35%, rgba(255, 255, 220, 0.12) 42%, rgba(255, 255, 200, 0.08) 50%, transparent 58%), linear-gradient(195deg, transparent 35%, rgba(255, 255, 220, 0.12) 42%, rgba(255, 255, 200, 0.08) 50%, transparent 58%), linear-gradient(90deg, transparent 60%, rgba(219, 39, 119, 0.08) 70%, transparent 80%), linear-gradient(90deg, transparent 20%, rgba(168, 85, 247, 0.08) 30%, transparent 40%)',
                }}
            />
            {/* Stage floor */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[28%] rounded-t-[50%]"
                style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(127, 0, 100, 0.4) 20%, rgba(88, 28, 135, 0.6) 100%)',
                    boxShadow: '0 -4px 30px rgba(251, 146, 60, 0.15)',
                }}
            />
            <div className="absolute bottom-[4%] left-[15%] w-20 h-12 rounded-full opacity-50" style={{ background: 'radial-gradient(ellipse, rgba(255,200,150,0.6), transparent 70%)', filter: 'blur(4px)' }} />
            <div className="absolute bottom-[5%] left-[45%] w-16 h-10 rounded-full opacity-40" style={{ background: 'radial-gradient(ellipse, rgba(200,150,255,0.5), transparent 70%)', filter: 'blur(4px)' }} />
            <div className="absolute bottom-[6%] right-[20%] w-24 h-14 rounded-full opacity-45" style={{ background: 'radial-gradient(ellipse, rgba(255,220,180,0.5), transparent 70%)', filter: 'blur(4px)' }} />
            <div className="absolute bottom-[3%] right-[40%] w-14 h-8 rounded-full opacity-35" style={{ background: 'radial-gradient(ellipse, rgba(180,180,255,0.5), transparent 70%)', filter: 'blur(4px)' }} />
            {/* Hazy overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)' }} />


            {/* Subtle dark overlay for depth */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-6 md:p-8">
                {/* Logo - Top Left */}
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-[#8655f6] to-[#d946ef] text-white shadow-[0_0_15px_rgba(137,90,246,0.5)]">
                        <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                    </div>
                    <h2 className="hidden md:block text-white text-xl font-bold tracking-tight"
                        onClick={() => navigate('/')}>TicketVibe</h2>
                </div>

                {/* Top Right - Create Account Link */}
                <div className="text-sm text-white">
                    New here?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-[#a855f7] hover:underline font-semibold"
                    >
                        Create an account
                    </button>
                </div>
            </header>

            {/* Main Content - Centered Login Card */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-20">
                {/* Login Card */}
                <div className="w-full backdrop-blur-xl p-8 md:p-10 rounded-3xl max-w-sm relative overflow-hidden group" style={{
                    background: 'linear-gradient(to bottom, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 70, 0.85) 50%, rgba(30, 20, 50, 0.9) 100%)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(134, 85, 246, 0.15), 0 0 15px rgba(134, 85, 246, 0.08), 0 0 30px rgba(236, 72, 153, 0.03)',
                    border: '1px solid rgba(134, 85, 246, 0.12)',
                    transform: 'translateY(0px)'
                }}>
                    {/* Inner glow effect - very subtle */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                        background: 'radial-gradient(ellipse at center, rgba(134, 85, 246, 0.05) 0%, transparent 70%)'
                    }}></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                            <p className="text-slate-300 text-sm">Please enter your details to sign in</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-300">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/reset-password')}
                                        className="text-xs text-[#a855f7] hover:underline font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                className="bg-gradient-to-r from-[#a855f7] to-[#d946ef] hover:shadow-lg hover:shadow-[#a855f7]/30 font-semibold text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang đăng nhập...' : 'Login'}
                            </Button>
                        </form>

                        {/* Social Login */}
                        <div className="mt-6">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gradient-to-b from-purple-900/60 via-purple-900/50 to-purple-900/60 text-slate-400 text-xs">OR CONTINUE WITH</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-sm font-medium">Google</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.05 13.5c0-1.3-.97-2.4-2.25-2.4-.6 0-1.17.23-1.6.65.02-1.8-.95-3.37-2.5-4.12C9.2 6.5 7.37 7.47 6.85 9.3c-.16.54-.24 1.1-.24 1.7 0 3.05 2.47 5.52 5.52 5.52 1.58 0 3-1.1 4.2-2.75 1.3-1.9 1.72-4.18 1.72-4.18zm-4.05 3.35c-1.08 0-1.95-.87-1.95-1.95s.87-1.95 1.95-1.95 1.95.87 1.95 1.95-.87 1.95-1.95 1.95z" />
                                    </svg>
                                    <span className="text-sm font-medium">Apple</span>
                                </button>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-300">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/signup')}
                                    className="text-[#a855f7] hover:underline font-semibold"
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-20 text-center py-6">
                <p className="text-sm text-white">© 2024 TicketVibe. All rights reserved.</p>
            </footer>
        </div>
    );
};

