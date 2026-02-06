import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import eventsData from '../../data/events.json';

export const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);

    // Get checkout data from navigation state
    const checkoutData = location.state;

    const event = useMemo(() =>
        checkoutData?.eventId ? eventsData.find(e => e.id === checkoutData.eventId) : null,
        [checkoutData?.eventId]);

    if (!checkoutData || !event) {
        return <Navigate to="/" replace />;
    }

    const { zone, seats, ticketCount, total } = checkoutData;

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            navigate('/payment-success', {
                state: {
                    event,
                    zone,
                    seats,
                    ticketCount,
                    total,
                    orderId: `TV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
                }
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-3xl font-bold">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <div className="bg-[#1e293b]/40 backdrop-blur border border-white/5 rounded-xl p-8">
                            {/* Visual Card */}
                            <div className="mb-8 w-full md:w-[320px] aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-[#8655f6] to-[#ec4899] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                                <div className="flex justify-between items-start z-10">
                                    <div className="w-12 h-8 bg-white/20 rounded" />
                                    <span className="font-bold italic text-xl">VISA</span>
                                </div>
                                <div className="z-10">
                                    <p className="font-mono text-xl tracking-widest mb-4">•••• •••• •••• 4242</p>
                                    <div className="flex justify-between text-xs uppercase tracking-wider opacity-80">
                                        <span>Alex Rivers</span>
                                        <span>12/28</span>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Card Number</label>
                                    <input
                                        className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-4 text-white focus:ring-[#8655f6] focus:border-[#8655f6]"
                                        placeholder="0000 0000 0000 0000"
                                        defaultValue="4242 4242 4242 4242"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Expiry Date</label>
                                        <input
                                            className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-4 text-white focus:ring-[#8655f6]"
                                            placeholder="MM/YY"
                                            defaultValue="12/28"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">CVC</label>
                                        <input
                                            className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-4 text-white focus:ring-[#8655f6]"
                                            placeholder="123"
                                            defaultValue="123"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Name on Card</label>
                                    <input
                                        className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-4 text-white focus:ring-[#8655f6]"
                                        placeholder="John Doe"
                                        defaultValue="Alex Rivers"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-[#1e293b]/60 backdrop-blur border border-white/5 rounded-xl p-6 sticky top-8">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            <div className="flex gap-4 mb-6">
                                <div
                                    className="w-16 h-16 rounded bg-cover bg-center shrink-0"
                                    style={{ backgroundImage: `url(${event.image})` }}
                                />
                                <div>
                                    <h4 className="font-bold line-clamp-2">{event.title}</h4>
                                    <p className="text-xs text-gray-400">
                                        {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-xs text-[#8655f6] mt-1">
                                        {zone.name} ({zone.type}) × {ticketCount}
                                    </p>
                                </div>
                            </div>

                            {/* Selected Seats List */}
                            {seats && seats.length > 0 && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {seats.map((seat: any) => (
                                        <span key={seat.id} className="text-[10px] px-2 py-1 rounded bg-white/10 text-gray-300">
                                            Row {seat.row}-{seat.number}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="border-t border-white/10 py-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Tickets ({ticketCount} × ${zone.price})</span>
                                    <span>${(ticketCount * zone.price).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Service Fee</span>
                                    <span>$15.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Processing Fee</span>
                                    <span>$5.00</span>
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-4 flex justify-between items-end mb-6">
                                <span className="text-gray-400">Total</span>
                                <span className="text-3xl font-bold">${(total + 20).toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold hover:shadow-lg hover:shadow-[#8655f6]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">lock</span>
                                        Confirm and Pay ${(total + 20).toLocaleString()}
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                Secured by 256-bit SSL encryption
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
