import React from 'react';
import { usePaymentTimer } from '../../contexts/PaymentTimerContext';

export const FloatingPaymentTimer: React.FC = () => {
    const { isTimerActive, timeLeft, paymentUrl, eventInfo, totalAmount, seatCount, stopTimer, cancelPayment } = usePaymentTimer();

    if (!isTimerActive || timeLeft === null) return null;

    if (timeLeft === 0) {
        return (
            <div className="fixed bottom-6 right-6 z-[999] w-[340px] bg-[#1e1828] border border-red-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 shrink-0">
                        <span className="material-symbols-outlined text-[24px]">
                            timer_off
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-red-400">
                            Hết thời gian thanh toán
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Đơn bị huỷ và ghế đã được trả lại.
                        </p>
                    </div>
                </div>
                <div className="px-4 pb-4">
                    <button
                        onClick={stopTimer}
                        className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#2a2438] text-white hover:bg-[#3a3447] transition-all border border-[#3a3447]"
                    >
                        Đóng thông báo
                    </button>
                </div>
            </div>
        );
    }

    // Format time (MM:SS)
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    // Percent for progress bar (5 mins = 300 secs)
    const progressPercent = Math.min(100, (timeLeft / 300) * 100);
    const isUrgent = timeLeft <= 60;

    return (
        <div className="fixed bottom-6 right-6 z-[999] w-[340px] bg-[#1e1828] border border-[#3a3447] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            {/* Header / Timer */}
            <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">
                            hourglass_top
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold mb-0.5 uppercase tracking-wide">
                            Đang chờ thanh toán
                        </p>
                        <p className={`text-2xl font-mono font-black tracking-tight leading-none ${isUrgent ? 'text-red-400' : 'text-amber-300'}`}>
                            {minutes}:{seconds}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-800">
                <div
                    className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-amber-400'}`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Details */}
            <div className="px-5 pt-3 pb-4">
                <div className="mb-4">
                    <p className="text-sm font-semibold text-white truncate mb-1" title={eventInfo?.title}>
                        {eventInfo?.title || 'Vé sự kiện'}
                    </p>
                    <p className="text-xs text-gray-400">
                        {seatCount} ghế · <span className="font-semibold text-white">{totalAmount.toLocaleString()} đ</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={cancelPayment}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#2a2438] text-gray-300 hover:bg-[#3a3447] hover:text-white transition-all border border-[#3a3447]"
                    >
                        Huỷ
                    </button>
                    {paymentUrl && (
                        <a
                            href={paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-[2] py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#8655f6] to-[#a855f7] text-white hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20"
                        >
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                            Thanh toán
                        </a>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(120%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};
