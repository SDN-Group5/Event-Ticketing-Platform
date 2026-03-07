import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

export const OTPPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as any)?.email || '';

    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

    useEffect(() => {
        if (!email) navigate('/register');
        inputRefs.current[0]?.focus();
    }, [email, navigate]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(s => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setError(null);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = Array(6).fill('');
        text.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputRefs.current[Math.min(text.length, 5)]?.focus();
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Vui lòng nhập đủ 6 chữ số.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Xác thực thất bại. Vui lòng thử lại.');
                return;
            }
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch {
            setError('Không thể kết nối server. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setIsResending(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Gửi lại mã thất bại.');
            } else {
                setOtp(Array(6).fill(''));
                inputRefs.current[0]?.focus();
                setResendCooldown(60);
            }
        } catch {
            setError('Không thể kết nối server.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="w-full backdrop-blur-xl p-8 md:p-10 rounded-3xl relative overflow-hidden" style={{
            background: 'linear-gradient(to bottom, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 70, 0.85) 50%, rgba(30, 20, 50, 0.9) 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(134,85,246,0.15)',
            border: '1px solid rgba(134,85,246,0.12)',
        }}>
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, rgba(134,85,246,0.05) 0%, transparent 70%)'
            }} />

            <div className="relative z-10">
                {/* Icon */}
                <div className="text-center mb-7">
                    <div className="inline-flex w-14 h-14 bg-gradient-to-br from-[#8655f6]/20 to-[#d946ef]/20 rounded-2xl items-center justify-center mb-4 ring-1 ring-[#8655f6]/30">
                        <span className="material-symbols-outlined text-3xl text-[#a855f7]">mark_email_read</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {success ? 'Xác thực thành công!' : 'Xác thực Email'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {success
                            ? 'Đang chuyển hướng đến trang đăng nhập...'
                            : <>Mã 6 chữ số đã gửi đến<br /><span className="text-white font-medium">{email}</span></>
                        }
                    </p>
                </div>

                {success ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center ring-1 ring-green-500/30">
                            <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
                        </div>
                        <div className="w-8 h-1 bg-[#a855f7]/50 rounded-full animate-pulse" />
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleVerify}>
                            {/* OTP inputs */}
                            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={el => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleChange(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        className={`w-12 h-14 rounded-xl text-center text-xl font-bold text-white transition-all duration-200
                                            bg-white/5 border focus:outline-none focus:ring-2
                                            ${digit ? 'border-[#a855f7] ring-[#a855f7]/30 bg-[#a855f7]/10' : 'border-white/10'}
                                            focus:border-[#a855f7] focus:ring-[#a855f7]/20`}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.join('').length < 6}
                                className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#a855f7]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xác thực...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[18px]">verified</span> Xác thực tài khoản</>
                                )}
                            </button>
                        </form>

                        {/* Resend */}
                        <div className="mt-5 text-center">
                            <p className="text-slate-400 text-sm">
                                Không nhận được mã?{' '}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending || resendCooldown > 0}
                                    className="text-[#a855f7] font-medium hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                                >
                                    {isResending
                                        ? 'Đang gửi...'
                                        : resendCooldown > 0
                                            ? `Gửi lại (${resendCooldown}s)`
                                            : 'Gửi lại mã'}
                                </button>
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-1.5 mx-auto transition-colors group"
                            >
                                <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                                Quay lại đăng nhập
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
