import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Zone360Viewer } from '../../components/Zone360Viewer';

export const ZoneSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedZone, setSelectedZone] = useState<string>('A');
    const [ticketCount, setTicketCount] = useState(2);
    const [is360ViewerOpen, setIs360ViewerOpen] = useState(false);

    const zones = [
        {
            id: 'A',
            name: 'Zone A',
            type: 'VIP',
            price: 120,
            color: '#8655f6',
            view360Url: '/360/concert-hall-360.jpg', // ảnh 360 cho Zone A
        },
        {
            id: 'B',
            name: 'Zone B',
            type: 'Standard',
            price: 80,
            color: '#3b82f6',
            // dùng ảnh Blackpink 3000x1500 mà bạn mới thêm
            view360Url: '/360/Blackpinks-Deadline-World-Tour (2).png',
        },
        {
            id: 'C',
            name: 'Zone C',
            type: 'General',
            price: 45,
            color: '#22c55e',
            view360Url: '/360/concert-hall-1.jpg', // tạm dùng chung với Zone B
        },
    ];

    const selectedZoneData = zones.find(z => z.id === selectedZone);
    const total = (selectedZoneData?.price || 0) * ticketCount;

    const handleCheckout = () => {
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
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/event/${id}`)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black">Select Your Zone</h1>
                        <p className="text-[#a59cba]">Neon Nights Festival 2024 • Main Stage</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {zones.map(zone => (
                        <span key={zone.id} className="px-3 py-1 rounded-full bg-[#2d2839] border border-white/5 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                            {zone.type}
                        </span>
                    ))}
                </div>
            </header>

            <div className="flex-1 bg-[#1e1a29] rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center mb-24">
                {/* Stage */}
                <div className="absolute top-10 w-1/3 h-20 bg-gradient-to-b from-[#2d2839] to-transparent border-t-4 border-gray-600 rounded-t-[50%] flex items-center justify-center">
                    <span className="text-gray-500 font-bold uppercase tracking-[0.3em]">Stage</span>
                </div>
                {/* Zones */}
                <div className="grid grid-cols-3 gap-8 w-2/3 mt-24">
                    {zones.map(zone => (
                        <div
                            key={zone.id}
                            onClick={() => setSelectedZone(zone.id)}
                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${selectedZone === zone.id
                                    ? 'border-2 shadow-[0_0_30px_rgba(134,85,246,0.3)]'
                                    : 'border hover:bg-white/5'
                                }`}
                            style={{
                                borderColor: selectedZone === zone.id ? zone.color : 'rgba(255,255,255,0.1)',
                                backgroundColor: selectedZone === zone.id ? `${zone.color}20` : 'transparent'
                            }}
                        >
                            <span className="font-bold text-xl">{zone.name}</span>
                            <span className="text-sm mt-1" style={{ color: zone.color }}>{zone.type}</span>
                            <span className="text-white text-lg font-bold mt-2">${zone.price}</span>
                            {selectedZone === zone.id && (
                                <div className="mt-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: zone.color }}>
                                    Selected
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-[#151022]/90 backdrop-blur border-t border-white/10 p-6 z-[150]">
                <div className="max-w-[1280px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div
                            className="h-12 w-16 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${selectedZoneData?.color}30` }}
                        >
                            <span className="font-bold" style={{ color: selectedZoneData?.color }}>{selectedZone}</span>
                        </div>
                        <div>
                            <h3 className="font-bold">{selectedZoneData?.name} ({selectedZoneData?.type})</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                                    className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
                                >
                                    −
                                </button>
                                <span className="text-sm text-[#a59cba]">{ticketCount} Tickets</span>
                                <button
                                    onClick={() => setTicketCount(ticketCount + 1)}
                                    className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
                                >
                                    +
                                </button>
                            </div>
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
                            className="bg-gradient-to-r from-[#8655f6] to-[#a855f7] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            Checkout
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
