import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const OTPPage: React.FC = () => {
    const navigate = useNavigate();
    const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuth();

    // Lấy email từ sessionStorage (được lưu từ SignupPage)
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState<number>(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const pendingEmail = sessionStorage.getItem('pending_verification_email');
        if (!pendingEmail) {
            // Nếu không có email, redirect về signup
            navigate('/signup');
            return;
        }
        setEmail(pendingEmail);
    }, [navigate]);

    // Countdown cho resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleOtpChange = (index: number, value: string) => {
        // Chỉ cho phép số
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus ô tiếp theo
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Backspace: xóa và lùi về ô trước
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSuccessMessage(null);

        const code = otp.join('');
        if (code.length !== 6) {
            return;
        }

        const ok = await verifyEmail(email, code);
        if (ok) {
            setSuccessMessage('Xác thực email thành công! Đang chuyển đến trang đăng nhập...');
            // Xóa email khỏi sessionStorage
            sessionStorage.removeItem('pending_verification_email');
            // Chuyển đến login sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || isLoading) return;

        clearError();
        setSuccessMessage(null);

        const ok = await resendVerification(email);
        if (ok) {
            setSuccessMessage('Đã gửi lại mã xác thực. Vui lòng kiểm tra email.');
            setResendCooldown(60); // 60 giây cooldown
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-[#1e293b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 bg-[#a855f7]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#a855f7]">
                    <span className="material-symbols-outlined text-4xl">mark_email_read</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Email Verification</h2>
                <p className="text-slate-400 text-sm mb-8">
                    Chúng tôi đã gửi mã 6 chữ số đến <br />
                    <span className="text-white font-medium">{email}</span>
                </p>

                <form onSubmit={handleVerify}>
                    <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 bg-slate-900/50 border border-slate-700 rounded-lg text-center text-xl font-bold text-white focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!isOtpComplete || isLoading}
                        className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-lg text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang xác thực...' : 'Verify Account'}
                    </button>
                </form>

                <div className="mt-6 text-sm text-slate-400">
                    Không nhận được mã?{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-[#a855f7] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã'}
                    </button>
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-slate-400 hover:text-white text-sm"
                    >
                        ← Quay lại đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
};
