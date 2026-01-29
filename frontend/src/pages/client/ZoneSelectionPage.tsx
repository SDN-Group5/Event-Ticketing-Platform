import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventLayoutViewer, PanoramaViewer } from '../../components/seats';
import { Seat as SeatType, SelectedSeat } from '../../types/seat';
import { getEventLayout } from '../../services/layoutService';

import eventsData from '../../data/events.json';
import seatMapsData from '../../data/seatMaps.json';

export const ZoneSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [ticketCount, setTicketCount] = useState(2); // Keep for potential future use or max validation
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
    const [previewSeat, setPreviewSeat] = useState<SeatType | null>(null);

    // Load event data
    const event = useMemo(() => eventsData.find(e => e.id === id), [id]);

    // Check for saved event layout first, fallback to seatMaps.json
    const zones = useMemo(() => {
        if (!id) return [];

        const savedLayout = getEventLayout(id);
        if (savedLayout && savedLayout.zones.length > 0) {
            return savedLayout.zones
                .filter(zone => zone.type === 'seats' || zone.type === 'standing' || zone.type === 'stage')
                .map(zone => ({
                    id: zone.id,
                    name: zone.name,
                    type: zone.type,
                    price: zone.price || 0,
                    color: zone.color,
                    rows: zone.rows || 1,
                    seatsPerRow: zone.seatsPerRow || 1,
                    position: zone.position,
                    size: zone.size
                }));
        }

        const seatMap = seatMapsData.find(sm => sm.id === event?.seatMapId);
        return seatMap?.zones || [];
    }, [id, event]);

    const total = useMemo(() => {
        return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    }, [selectedSeats]);

    const handleSeatToggle = (seat: SelectedSeat) => {
        setSelectedSeats(prev => {
            const exists = prev.find(s => s.id === seat.id);
            if (exists) {
                return prev.filter(s => s.id !== seat.id);
            } else {
                return [...prev, seat];
            }
        });
    };

    const handleCheckout = () => {
        const checkoutData = {
            eventId: id,
            seats: selectedSeats,
            total
        };
        console.log('Checkout data:', checkoutData);
        navigate('/checkout');
    };

    if (!event) {
        return (
            <div className="min-h-screen bg-[#151022] text-white flex flex-col items-center justify-center p-6">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                <h1 className="text-3xl font-black mb-2">Event Not Found</h1>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-white/10 rounded-xl font-bold mt-4">
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#151022] text-white p-6 flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/event/${id}`)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black">Select Your Seats</h1>
                        <p className="text-[#a59cba]">
                            {event?.title} • {event?.location}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content: Unified Layout Viewer */}
            <div className="flex-1 bg-[#1e1a29] rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center mb-36">
                <EventLayoutViewer
                    zones={zones}
                    selectedSeats={selectedSeats}
                    onSeatToggle={handleSeatToggle}
                />
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-[#151022]/90 backdrop-blur border-t border-white/10 p-6">
                <div className="max-w-[1280px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-sm text-[#a59cba]">Selected:</span>
                            <span className="text-xl font-bold ml-2">{selectedSeats.length} seats</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs text-[#a59cba] uppercase font-bold">Total</p>
                            <p className="text-2xl font-black">${total.toLocaleString()}</p>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={selectedSeats.length === 0}
                            className={`font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 ${selectedSeats.length > 0
                                ? 'bg-gradient-to-r from-[#8655f6] to-[#a855f7] text-white hover:brightness-110'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <span>Checkout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Panorama Preview (Optional integration if we add preview button/logic back) */}
            {previewSeat && (
                <PanoramaViewer
                    seat={previewSeat}
                    onClose={() => setPreviewSeat(null)}
                    zoneColor="#8655f6"
                    zoneName="Preview"
                />
            )}
        </div>
    );
};
