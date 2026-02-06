import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [localError, setLocalError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        clearError();

        if (!firstName || !lastName || !email || !password) {
            setLocalError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (password.length < 6) {
            setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Mật khẩu xác nhận không khớp.');
            return;
        }

        const ok = await register({ firstName, lastName, email, password });
        if (!ok) return;

        // Lưu email vào sessionStorage để OTPPage sử dụng
        sessionStorage.setItem('pending_verification_email', email);
        navigate('/otp');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-400 text-sm mt-2">Sign up to continue</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                        />
                        <input
                            type="text"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                        />
                    </div>

                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                    />

                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                    />

                    {(localError || error) && (
                        <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                            {localError || error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-[#a855f7] to-[#d946ef] hover:shadow-lg hover:shadow-[#a855f7]/30 font-semibold text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang tạo tài khoản...' : 'Sign up'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-300">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-[#a855f7] hover:underline font-semibold"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
