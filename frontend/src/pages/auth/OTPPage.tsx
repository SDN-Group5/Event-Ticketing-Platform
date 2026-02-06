import React from 'react';

export const OTPPage: React.FC = () => {
    return (
        <div className="w-full max-w-[440px] bg-[#1e293b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#a855f7]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#a855f7]">
                <span className="material-symbols-outlined text-4xl">mark_email_read</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verification</h2>
            <p className="text-slate-400 text-sm mb-8">
                We've sent a 6-digit numeric code to <br />
                <span className="text-white">alex.smith@example.com</span>
            </p>
            <div className="flex gap-2 justify-center mb-8">
                {[4, 8, 2, 0, 0, 0].map((num, i) => (
                    <input
                        key={i}
                        type="text"
                        value={num}
                        className="w-12 h-14 bg-slate-900/50 border border-slate-700 rounded-lg text-center text-xl font-bold text-white focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]"
                        readOnly
                    />
                ))}
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-lg text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">
                Verify Account
            </button>
        </div>
    );
};
