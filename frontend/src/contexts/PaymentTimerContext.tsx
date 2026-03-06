import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    timeLeft: number | null; // Calculated value exposed for UI
}

const PaymentTimerContext = createContext<PaymentTimerContextType | undefined>(undefined);

export const PaymentTimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<PaymentTimerState>(() => {
        // Khôi phục state từ localStorage phòng khi user F5
        const saved = localStorage.getItem('payment_timer_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Nếu đã hết hạn thì không restore nữa
                if (parsed.endTime && Date.now() < parsed.endTime) {
                    return parsed;
                }
            } catch (e) {
                console.error('Failed to parse payment timer state from local storage');
            }
        }
        return {
            isTimerActive: false,
            endTime: null,
            paymentUrl: null,
            orderCode: null,
            eventInfo: null,
            totalAmount: 0,
            seatCount: 0,
        };
    });

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Persist state to localStorage
    useEffect(() => {
        if (state.isTimerActive) {
            localStorage.setItem('payment_timer_state', JSON.stringify(state));
        } else {
            localStorage.removeItem('payment_timer_state');
        }
    }, [state]);

    // Timer logic
    useEffect(() => {
        if (!state.isTimerActive || !state.endTime) {
            setTimeLeft(null);
            return;
        }

        const intervalId = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((state.endTime! - now) / 1000));

            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(intervalId);
                window.dispatchEvent(new CustomEvent('payment-timer-expired'));
            }
        }, 1000);

        // Chạy lần đầu ngay lập tức để không bị delay 1s
        const remaining = Math.max(0, Math.floor((state.endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
            window.dispatchEvent(new CustomEvent('payment-timer-expired'));
        }

        return () => clearInterval(intervalId);
    }, [state.isTimerActive, state.endTime]);

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
                // Gọi API huỷ lên hệ thống PayOS/Backend
                await PaymentAPI.cancelPayment(state.orderCode);
            } catch (error) {
                console.error('Failed to cancel payment:', error);
            }
        }
        stopTimer();
        window.dispatchEvent(new CustomEvent('payment-timer-cancelled'));
    };

    return (
        <PaymentTimerContext.Provider value={{
            ...state,
            startTimer,
            stopTimer,
            cancelPayment,
            timeLeft
        }}>
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
