import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePaymentTimer } from '../../contexts/PaymentTimerContext';

export const FloatingPaymentTimer: React.FC = () => {
    const { isTimerActive, timeLeft, paymentUrl, eventInfo, totalAmount, seatCount, stopTimer, cancelPayment } = usePaymentTimer();

    // Drag and drop state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const timerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag if clicking the header or empty space, not buttons
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;

        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const newX = e.clientX - dragStartPos.current.x;
            const newY = e.clientY - dragStartPos.current.y;

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!isDragging) return;
            setIsDragging(false);

            // Snapping logic
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const cardWidth = 280;
            const cardHeight = timerRef.current?.offsetHeight || 150;
            const margin = 24;

            // Current absolute position
            // Initial position: right: 24, bottom: 96
            const initialRightX = windowWidth - margin - cardWidth;
            const currentX = initialRightX + position.x;

            const initialBottomY = windowHeight - 96 - cardHeight;
            const currentY = initialBottomY + position.y;

            // 1. Horizontal snap (left or right)
            let finalX = position.x;
            if (currentX + cardWidth / 2 < windowWidth / 2) {
                // Snap to left
                finalX = margin - initialRightX;
            } else {
                // Snap to right
                finalX = 0; // back to original right-6
            }

            // 2. Vertical clamping (don't let it go off screen)
            let finalY = position.y;
            // Calculate min/max Y based on the initial bottom-24 (96px) offset
            const minY = -initialBottomY + margin; // top of screen (margin from top)
            const maxY = (windowHeight - margin - cardHeight) - initialBottomY; // bottom of screen (margin from bottom)

            if (currentY < margin) { // If current top edge is above margin
                finalY = minY;
            } else if (currentY + cardHeight > windowHeight - margin) { // If current bottom edge is below margin
                finalY = maxY;
            }

            setPosition({ x: finalX, y: finalY });
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, position.x, position.y]);

    if (!isTimerActive || timeLeft === null) return null;

    if (timeLeft === 0) {
        return (
            <div
                ref={timerRef}
                onMouseDown={handleMouseDown}
                style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging ? 'grabbing' : 'grab' }}
                className={`fixed bottom-24 right-6 z-[999] w-[280px] bg-[#1e1828] border border-red-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up ${isDragging ? 'transition-none' : 'transition-all duration-300 ease-out'}`}
            >
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
        <div
            ref={timerRef}
            onMouseDown={handleMouseDown}
            style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging ? 'grabbing' : 'grab' }}
            className={`fixed bottom-24 right-6 z-[999] w-[280px] bg-[#1e1828] border border-[#3a3447] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up ${isDragging ? 'transition-none' : 'transition-transform duration-75'}`}
        >
            {/* Header / Timer */}
            <div className="flex items-center justify-between p-3 pb-2 select-none">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <span className="material-symbols-outlined text-[16px]">
                            hourglass_top
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-semibold mb-0 uppercase tracking-wide leading-tight">
                            Chờ thanh toán
                        </p>
                        <p className={`text-xl font-mono font-black tracking-tight leading-none ${isUrgent ? 'text-red-400' : 'text-amber-300'}`}>
                            {minutes}:{seconds}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-[3px] bg-gray-800">
                <div
                    className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-amber-400'}`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Details */}
            <div className="px-3 pt-2 pb-3 select-none">
                <div className="mb-3">
                    <p className="text-sm font-semibold text-white truncate mb-0.5" title={eventInfo?.title}>
                        {eventInfo?.title || 'Vé sự kiện'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                        {seatCount} ghế · <span className="font-semibold text-white">{totalAmount.toLocaleString()} đ</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={cancelPayment}
                        className="flex-1 py-1.5 rounded-md text-[13px] font-semibold bg-[#2a2438] text-gray-300 hover:bg-[#3a3447] hover:text-white transition-all border border-[#3a3447]"
                    >
                        Huỷ
                    </button>
                    {paymentUrl && (
                        <a
                            href={paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-[2] py-1.5 rounded-md text-[13px] font-bold bg-gradient-to-r from-[#8655f6] to-[#a855f7] text-white hover:brightness-110 transition-all flex items-center justify-center gap-1 shadow-md shadow-purple-500/20"
                        >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            PayOS
                        </a>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(120%) translate(${position.x}px, ${position.y}px); opacity: 0; }
                    to { transform: translateY(0) translate(${position.x}px, ${position.y}px); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};
