import React from 'react';

export const ResetPasswordPage: React.FC = () => {
    return (
        <div className="w-full bg-[#1e293b]/40 backdrop-blur border border-white/10 p-10 rounded-3xl">
            <div className="text-center mb-8">
                <div className="inline-flex w-16 h-16 bg-[#8655f6]/10 rounded-2xl items-center justify-center mb-4 text-[#8655f6]">
                    <span className="material-symbols-outlined text-3xl">lock_reset</span>
                </div>
                <h1 className="text-3xl font-bold text-white">Reset Password</h1>
                <p className="text-slate-400 text-sm mt-2">Enter your email and we will send you instructions.</p>
            </div>
            <form className="space-y-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3.5 pl-12 text-white focus:border-[#8655f6] focus:ring-[#8655f6]"
                    />
                </div>
                <button className="w-full py-4 bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold rounded-xl">
                    Send Reset Link
                </button>
            </form>
            <div className="mt-8 text-center">
                <a href="#" className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Login
                </a>
            </div>
        </div>
    );
};
