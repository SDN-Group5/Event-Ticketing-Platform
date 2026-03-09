import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { PaymentAPI } from '../services/paymentApiService';

export interface PaymentTimerState {
    isTimerActive: boolean;
    endTime: number | null;
    paymentUrl: string | null;
    orderCode: string | number | null;
    eventInfo: {
        eventId: string;
        title: string;
    } | null;
    totalAmount: number;
    seatCount: number;
}

interface PaymentTimerContextType extends PaymentTimerState {
    startTimer: (
        durationSeconds: number,
        paymentUrl: string,
        orderCode: string | number,
        eventInfo: { eventId: string; title: string },
        totalAmount: number,
        seatCount: number
    ) => void;
    stopTimer: () => void;
    cancelPayment: () => Promise<void>;
    timeLeft: number | null;
}

const STORAGE_KEY = 'payment_timer_state';

const PaymentTimerContext = createContext<PaymentTimerContextType | undefined>(undefined);

export const PaymentTimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<PaymentTimerState>(() => {
        // Khôi phục state từ localStorage phòng khi user F5
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.endTime && Date.now() < parsed.endTime) return parsed;
            } catch { /* ignored */ }
        }
        return {
            isTimerActive: false, endTime: null, paymentUrl: null,
            orderCode: null, eventInfo: null, totalAmount: 0, seatCount: 0,
        };
    });

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ─── Persist state → localStorage ──────────────────────────────────────
    useEffect(() => {
        if (state.isTimerActive) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [state]);

    // ─── Cross-tab Cancel Detection via storage event ───────────────────────
    // Khi PaymentCancelPage mở trong tab mới xoá STORAGE_KEY,
    // tab gốc lắng nghe 'storage' event để tự tắt timer.
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue === null && state.isTimerActive) {
                setState(prev => ({ ...prev, isTimerActive: false }));
                window.dispatchEvent(new CustomEvent('payment-timer-cancelled'));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [state.isTimerActive]);

    // ─── Polling fallback (mỗi 10s) ────────────────────────────────────────
    // Backup check: poll API để phát hiện nếu order đã cancelled/paid
    useEffect(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        if (!state.isTimerActive || !state.orderCode) return;

        pollRef.current = setInterval(async () => {
            try {
                const result = await PaymentAPI.verifyPayment(state.orderCode!);
                if (result.status === 'cancelled' || result.status === 'deleted') {
                    setState(prev => ({ ...prev, isTimerActive: false }));
                    window.dispatchEvent(new CustomEvent('payment-timer-cancelled'));
                } else if (result.status === 'paid') {
                    setState(prev => ({ ...prev, isTimerActive: false }));
                }
            } catch { /* ignore poll errors */ }
        }, 10_000);

        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [state.isTimerActive, state.orderCode]);

    // ─── Countdown Timer ────────────────────────────────────────────────────
    useEffect(() => {
        if (!state.isTimerActive || !state.endTime) {
            setTimeLeft(null);
            return;
        }

        const tick = () => {
            const remaining = Math.max(0, Math.floor((state.endTime! - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                window.dispatchEvent(new CustomEvent('payment-timer-expired'));
            }
        };

        tick(); // Chạy ngay lập tức, không delay 1s
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [state.isTimerActive, state.endTime]);

    // ─── Actions ────────────────────────────────────────────────────────────
    const startTimer = (
        durationSeconds: number,
        paymentUrl: string,
        orderCode: string | number,
        eventInfo: { eventId: string; title: string },
        totalAmount: number,
        seatCount: number
    ) => {
        setState({
            isTimerActive: true,
            endTime: Date.now() + durationSeconds * 1000,
            paymentUrl,
            orderCode,
            eventInfo,
            totalAmount,
            seatCount,
        });
    };

    const stopTimer = () => {
        setState(prev => ({ ...prev, isTimerActive: false }));
    };

    const cancelPayment = async () => {
        if (state.orderCode) {
            try {
                await PaymentAPI.cancelPayment(state.orderCode);
            } catch (error) {
                console.error('Failed to cancel payment:', error);
            }
        }
        stopTimer();
        window.dispatchEvent(new CustomEvent('payment-timer-cancelled'));
    };

    return (
        <PaymentTimerContext.Provider value={{ ...state, startTimer, stopTimer, cancelPayment, timeLeft }}>
            {children}
        </PaymentTimerContext.Provider>
    );
};

export const usePaymentTimer = () => {
    const context = useContext(PaymentTimerContext);
    if (context === undefined) {
        throw new Error('usePaymentTimer must be used within a PaymentTimerProvider');
    }
    return context;
};
