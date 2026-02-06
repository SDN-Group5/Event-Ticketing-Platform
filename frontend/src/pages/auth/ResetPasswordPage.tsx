import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type Step = 'email' | 'otp' | 'newPassword';

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { forgotPassword, verifyResetCode, resetPassword, isLoading, error, clearError } = useAuth();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState<number>(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown cho resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // ============================================
    // STEP 1: Gửi email để nhận mã reset
    // ============================================
    const handleSendResetCode = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        setSuccessMessage(null);

        if (!email) {
            setLocalError('Vui lòng nhập email.');
            return;
        }

        const ok = await forgotPassword(email);
        if (ok) {
            setSuccessMessage('Đã gửi mã xác thực đến email của bạn.');
            setStep('otp');
            setResendCooldown(60);
        }
    };

    // ============================================
    // STEP 2: Nhập OTP
    // ============================================
    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        setSuccessMessage(null);

        const code = otp.join('');
        if (code.length !== 6) {
            setLocalError('Vui lòng nhập đủ 6 chữ số.');
            return;
        }

        const ok = await verifyResetCode(email, code);
        if (ok) {
            setSuccessMessage('Mã xác thực hợp lệ. Vui lòng đặt mật khẩu mới.');
            setStep('newPassword');
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || isLoading) return;

        clearError();
        setLocalError(null);
        setSuccessMessage(null);

        const ok = await forgotPassword(email);
        if (ok) {
            setSuccessMessage('Đã gửi lại mã xác thực.');
            setResendCooldown(60);
            setOtp(['', '', '', '', '', '']);
        }
    };

    // ============================================
    // STEP 3: Đặt mật khẩu mới
    // ============================================
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        setSuccessMessage(null);

        if (!newPassword || newPassword.length < 6) {
            setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setLocalError('Mật khẩu xác nhận không khớp.');
            return;
        }

        const code = otp.join('');
        const ok = await resetPassword(email, code, newPassword);
        if (ok) {
            setSuccessMessage('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 bg-[#8655f6]/20 rounded-2xl items-center justify-center mb-4 text-[#8655f6]">
                        <span className="material-symbols-outlined text-3xl">
                            {step === 'email' ? 'lock_reset' : step === 'otp' ? 'pin' : 'password'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {step === 'email' && 'Quên mật khẩu'}
                        {step === 'otp' && 'Nhập mã xác thực'}
                        {step === 'newPassword' && 'Đặt mật khẩu mới'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">
                        {step === 'email' && 'Nhập email để nhận mã đặt lại mật khẩu'}
                        {step === 'otp' && (
                            <>
                                Mã 6 chữ số đã được gửi đến <br />
                                <span className="text-white font-medium">{email}</span>
                            </>
                        )}
                        {step === 'newPassword' && 'Tạo mật khẩu mới cho tài khoản'}
                    </p>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mb-6">
                    {['email', 'otp', 'newPassword'].map((s, i) => (
                        <div
                            key={s}
                            className={`w-2 h-2 rounded-full transition-all ${step === s ? 'bg-[#a855f7] w-6' : i < ['email', 'otp', 'newPassword'].indexOf(step) ? 'bg-emerald-500' : 'bg-slate-600'
                                }`}
                        />
                    ))}
                </div>

                {/* STEP 1: Email */}
                {step === 'email' && (
                    <form onSubmit={handleSendResetCode} className="space-y-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email của bạn"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                                required
                            />
                        </div>

                        {(localError || error) && (
                            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                                {localError || error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold rounded-xl disabled:opacity-60"
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
                        </button>
                    </form>
                )}

                {/* STEP 2: OTP */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div className="flex gap-2 justify-center mb-2" onPaste={handlePaste}>
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

                        <div className="text-center text-sm text-slate-400">
                            Không nhận được mã?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendCooldown > 0 || isLoading}
                                className="text-[#a855f7] hover:underline font-medium disabled:opacity-50"
                            >
                                {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại'}
                            </button>
                        </div>

                        {(localError || error) && (
                            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                                {localError || error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!isOtpComplete || isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold rounded-xl disabled:opacity-60"
                        >
                            {isLoading ? 'Đang xác thực...' : 'Xác thực mã'}
                        </button>
                    </form>
                )}

                {/* STEP 3: New Password */}
                {step === 'newPassword' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mật khẩu mới"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                                required
                            />
                        </div>

                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Xác nhận mật khẩu"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                                required
                            />
                        </div>

                        {(localError || error) && (
                            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                                {localError || error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold rounded-xl disabled:opacity-60"
                        >
                            {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>
                )}

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Quay lại đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
};
