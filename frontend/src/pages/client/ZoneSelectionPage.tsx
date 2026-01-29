import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventLayoutViewer, PanoramaViewer } from '../../components/seats';
import { Seat as SeatType, SelectedSeat } from '../../types/seat';
import { getEventLayout } from '../../services/layoutService';

import eventsData from '../../data/events.json';
import seatMapsData from '../../data/seatMaps.json';
import { Zone360Viewer } from '../../components/Zone360Viewer';

export const ZoneSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [ticketCount, setTicketCount] = useState(2); // Keep for potential future use or max validation
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
    const [previewSeat, setPreviewSeat] = useState<SeatType | null>(null);
    const [is360ViewerOpen, setIs360ViewerOpen] = useState(false);
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
                    size: zone.size,
                    view360Url: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg' // Mock 360 image
                }));
        }

        const seatMap = seatMapsData.find(sm => sm.id === event?.seatMapId);
        return seatMap?.zones.map(z => ({ ...z, view360Url: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg' })) || [];
    }, [id, event]);

    const total = useMemo(() => {
        return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    }, [selectedSeats]);

    const selectedZoneData = useMemo(() => {
        if (selectedSeats.length > 0) {
            const lastSeat = selectedSeats[selectedSeats.length - 1];
            return zones.find(z => z.name === lastSeat.zone);
        }
        return zones[0];
    }, [selectedSeats, zones]);
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

    const handleOpen360 = () => {
        // Mở tab phụ để user kiểm tra WebGL (spinning cube)
        window.open('https://get.webgl.org/', '_blank', 'noopener,noreferrer');
        // Đồng thời mở modal 360 trong app
        setIs360ViewerOpen(true);
    };

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
            <div className="fixed bottom-0 left-0 w-full bg-[#151022]/90 backdrop-blur border-t border-white/10 p-6 z-[150]">
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
                            onClick={handleOpen360}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">360</span>
                            View 360° from this zone
                        </button>
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

            {/* 360 Viewer Modal */}
            <Zone360Viewer
                imageUrl={selectedZoneData?.view360Url || ''}
                isOpen={is360ViewerOpen}
                onClose={() => setIs360ViewerOpen(false)}
                zoneName={selectedZoneData ? `${selectedZoneData.name} (${selectedZoneData.type})` : ''}
            />
        </div>
    );
};
