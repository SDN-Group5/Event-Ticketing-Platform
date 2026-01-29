import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8655f6]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#ec4899]/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center mb-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-[#8655f6] to-[#ec4899] mb-6 shadow-[0_0_60px_rgba(134,85,246,0.5)] animate-pulse">
                    <span className="material-symbols-outlined text-5xl text-white font-bold">check</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-slate-400 text-lg">Get ready for an unforgettable night! 🎉</p>
            </div>

            {/* Ticket Card */}
            <div className="w-full max-w-md bg-gradient-to-b from-[#1e293b]/80 to-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                {/* Ticket Notch */}
                <div className="absolute top-2/3 left-0 -translate-x-1/2 w-8 h-8 bg-[#0f172a] rounded-full" />
                <div className="absolute top-2/3 right-0 translate-x-1/2 w-8 h-8 bg-[#0f172a] rounded-full" />
                <div className="absolute top-2/3 left-4 right-4 border-b-2 border-dashed border-white/10" />

                <div
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDi6Oy71QOrOhpI-eEIZzHCZiMS_yadvN2UnsBAJsc0c9onFTs33e__ir4YWKaYR6eM-SDx4P9LmTzvTfsjNZ9DeRiTs97ZsBA6xSbHFhbu__IpgbqKDQ5AoKI6LL13YZQO-uKaKWYpRDe1Z2yfGY4HZU3DTsc68i27BNEhYnNebUw1ty7S9Qx6n1LG7aO2ruJdhaWzl8zC0KLUYm2ILm8ZxUWXNhcq72VRo79cKc3NBeZSrp43nmH9skeO7byVQjk2AtdTux1kRS8y)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent" />
                    <div className="absolute bottom-4 left-6">
                        <span className="px-3 py-1 bg-[#8655f6] text-white text-xs font-bold rounded-full">VIP ACCESS</span>
                        <h2 className="text-2xl font-bold text-white mt-2">Neon Nights 2024</h2>
                    </div>
                </div>

                <div className="p-6 pt-8 space-y-4">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Date</p>
                            <p className="font-semibold">Sep 24, 2024</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase">Time</p>
                            <p className="font-semibold">8:00 PM EST</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Venue</p>
                            <p className="font-semibold">Grand Arena, NY</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase">Zone</p>
                            <p className="font-semibold">Zone A (VIP)</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Tickets</p>
                        <p className="font-semibold">2 × VIP Access</p>
                    </div>
                </div>

                <div className="p-6 bg-white/5 flex flex-col items-center justify-center">
                    <div className="bg-white p-3 rounded-xl mb-3">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=TicketVibe-VIP-2024" alt="QR" className="w-28 h-28" />
                    </div>
                    <p className="text-xs text-gray-500 font-mono">Order ID: TV-2024-8X92K291</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 w-full max-w-md">
                <button className="flex-1 py-3 border border-gray-600 rounded-xl font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download PDF
                </button>
                <button
                    onClick={() => navigate('/profile')}
                    className="flex-1 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-xl font-bold hover:shadow-lg hover:shadow-[#8655f6]/30 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">confirmation_number</span>
                    My Tickets
                </button>
            </div>

            <button
                onClick={() => navigate('/')}
                className="mt-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Home
            </button>
        </div>
    );
};
