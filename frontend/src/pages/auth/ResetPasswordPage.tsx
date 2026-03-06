import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4001';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    // ─── Step 1: Gửi email ───────────────────────────────────────────
    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data?.message || 'Gửi email thất bại. Vui lòng thử lại.');
                return;
            }
            setStep('otp');
        } catch {
            setError('Không thể kết nối server. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Step 2: Xác nhận OTP ────────────────────────────────────────
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        if (!otp.trim() || otp.length < 6) {
            setError('Vui lòng nhập mã OTP 6 chữ số.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Mã OTP không hợp lệ.');
                return;
            }
            setStep('newPassword');
        } catch {
            setError('Không thể kết nối server. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Step 3: Đặt mật khẩu mới ───────────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Đặt lại mật khẩu thất bại.');
                return;
            }
            setStep('success');
        } catch {
            setError('Không thể kết nối server. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Step labels ─────────────────────────────────────────────────
    const steps = [
        { key: 'email', label: 'Email' },
        { key: 'otp', label: 'Xác nhận' },
        { key: 'newPassword', label: 'Mật khẩu' },
    ];
    const currentStepIdx = steps.findIndex(s => s.key === step);

    return (
        <div className="w-full backdrop-blur-xl p-8 md:p-10 rounded-3xl relative overflow-hidden" style={{
            background: 'linear-gradient(to bottom, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 70, 0.85) 50%, rgba(30, 20, 50, 0.9) 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(134,85,246,0.15)',
            border: '1px solid rgba(134,85,246,0.12)',
        }}>
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, rgba(134,85,246,0.05) 0%, transparent 70%)'
            }} />

            <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-7">
                    <div className="inline-flex w-14 h-14 bg-gradient-to-br from-[#8655f6]/20 to-[#d946ef]/20 rounded-2xl items-center justify-center mb-4 ring-1 ring-[#8655f6]/30">
                        <span className="material-symbols-outlined text-3xl text-[#a855f7]">lock_reset</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {step === 'success' ? 'Thành công!' : 'Quên mật khẩu'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {step === 'email' && 'Nhập email để nhận mã đặt lại mật khẩu'}
                        {step === 'otp' && `Mã OTP đã gửi đến ${email}`}
                        {step === 'newPassword' && 'Tạo mật khẩu mới cho tài khoản'}
                        {step === 'success' && 'Mật khẩu đã được đặt lại thành công'}
                    </p>
                </div>

                {/* Step indicator (ẩn khi success) */}
                {step !== 'success' && (
                    <div className="flex items-center justify-center gap-2 mb-7">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s.key}>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${idx < currentStepIdx
                                            ? 'bg-[#a855f7] text-white'
                                            : idx === currentStepIdx
                                                ? 'bg-gradient-to-br from-[#a855f7] to-[#d946ef] text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                                                : 'bg-white/10 text-slate-500'
                                        }`}>
                                        {idx < currentStepIdx
                                            ? <span className="material-symbols-outlined text-[14px]">check</span>
                                            : idx + 1}
                                    </div>
                                    <span className={`text-xs hidden sm:block ${idx === currentStepIdx ? 'text-white font-medium' : 'text-slate-500'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-px max-w-[32px] transition-all duration-500 ${idx < currentStepIdx ? 'bg-[#a855f7]' : 'bg-white/10'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Error toast */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                {/* ── Step 1: Email ── */}
                {step === 'email' && (
                    <form onSubmit={handleSendEmail} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); clearError(); }}
                                    placeholder="name@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#a855f7]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[18px]">send</span> Gửi mã OTP</>
                            )}
                        </button>
                    </form>
                )}

                {/* ── Step 2: OTP ── */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Mã OTP</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">password</span>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); clearError(); }}
                                    placeholder="- - - - - -"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all tracking-[0.3em] text-center font-mono text-lg"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 text-center">Mã có hiệu lực trong 1 phút</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#a855f7]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xác nhận...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[18px]">verified</span> Xác nhận mã OTP</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Đổi email khác
                        </button>
                    </form>
                )}

                {/* ── Step 3: Mật khẩu mới ── */}
                {step === 'newPassword' && (
                    <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu mới</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); clearError(); }}
                                    placeholder="Ít nhất 6 ký tự"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_open</span>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => { setConfirmPassword(e.target.value); clearError(); }}
                                    placeholder="Nhập lại mật khẩu"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                                    <span className="material-symbols-outlined text-xl">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#a855f7]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[18px]">save</span> Đặt lại mật khẩu</>
                            )}
                        </button>
                    </form>
                )}

                {/* ── Success ── */}
                {step === 'success' && (
                    <div className="text-center space-y-4">
                        <div className="inline-flex w-16 h-16 bg-green-500/15 rounded-full items-center justify-center ring-1 ring-green-500/30">
                            <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
                        </div>
                        <p className="text-slate-300 text-sm">Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#a855f7]/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">login</span>
                            Đăng nhập ngay
                        </button>
                    </div>
                )}

                {/* Back to Login */}
                {step !== 'success' && (
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-1.5 mx-auto transition-colors group"
                        >
                            <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                            Quay lại đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
