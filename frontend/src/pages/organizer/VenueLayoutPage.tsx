import React, { useState } from 'react';
import { SeatMap } from '../../components/seats';
import { SeatZone, Seat as SeatType } from '../../types/seat';

export const VenueLayoutPage: React.FC = () => {
    const [layoutName, setLayoutName] = useState('New Stage Layout');
    const [zones, setZones] = useState<SeatZone[]>([
        { id: '1', name: 'Zone A', type: 'regular', price: 50, color: '#3b82f6', rows: 5, seatsPerRow: 10 }
    ]);
    const [selectedZoneId, setSelectedZoneId] = useState<string>('1');
    const [notifications, setNotifications] = useState<string | null>(null);

    const activeZone = zones.find(z => z.id === selectedZoneId);

    const handleAddZone = () => {
        const newZone: SeatZone = {
            id: Date.now().toString(),
            name: `Zone ${String.fromCharCode(65 + zones.length)}`,
            type: 'regular',
            price: 50,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            rows: 5,
            seatsPerRow: 10
        };
        setZones([...zones, newZone]);
        setSelectedZoneId(newZone.id);
    };

    const handleUpdateZone = (id: string, updates: Partial<SeatZone>) => {
        setZones(zones.map(z => z.id === id ? { ...z, ...updates } : z));
    };

    const handleSaveLayout = () => {
        // In a real app, this would POST to backend
        const layoutData = {
            id: `sm_${Date.now()}`,
            name: layoutName,
            zones: zones
        };
        console.log('Saving Layout:', layoutData);

        // Find if we are updating existing mock data (simulated)
        // seatMapsData.push(layoutData); // Can't push to import, but this shows intent

        setNotifications('Layout saved successfully! (Check console)');
        setTimeout(() => setNotifications(null), 3000);
    };

    const handleLayoutSeatsSave = (newSeats: SeatType[]) => {
        console.log('Seat configuration updated for zone', activeZone?.name, newSeats);
        // Here we would store the specific seat configuration (blocked seats etc)
        // For now, we assume the SeatMap's internal generation + modifications would be persisted
    };

    return (
        <div className="min-h-screen bg-[#151022] text-white p-8">
            <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black">Venue Layout Editor</h1>
                    <p className="text-[#a59cba]">Design your stage and seating arrangements</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 font-bold">
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveLayout}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8655f6] to-[#d946ef] hover:brightness-110 font-bold shadow-lg"
                    >
                        Save Entire Layout
                    </button>
                </div>
            </header>

            {notifications && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in">
                    {notifications}
                </div>
            )}

            <div className="flex gap-8">
                {/* Sidebar - Zone Config */}
                <div className="w-80 flex flex-col gap-6">
                    <div className="bg-[#1e1a29] p-6 rounded-2xl border border-white/5">
                        <label className="block text-sm text-[#a59cba] mb-2 font-bold">Layout Name</label>
                        <input
                            type="text"
                            value={layoutName}
                            onChange={(e) => setLayoutName(e.target.value)}
                            className="w-full bg-[#151022] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#8655f6] outline-none transition-colors"
                        />
                    </div>

                    <div className="bg-[#1e1a29] p-6 rounded-2xl border border-white/5 flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Zones</h3>
                            <button
                                onClick={handleAddZone}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                            >
                                +
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {zones.map(zone => (
                                <div
                                    key={zone.id}
                                    onClick={() => setSelectedZoneId(zone.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedZoneId === zone.id
                                            ? 'bg-[#8655f6]/10 border-[#8655f6]'
                                            : 'bg-[#151022] border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <input
                                            value={zone.name}
                                            onChange={(e) => handleUpdateZone(zone.id, { name: e.target.value })}
                                            className="bg-transparent font-bold w-full outline-none"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: zone.color }} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <label className="text-[#a59cba] text-xs">Rows</label>
                                            <input
                                                type="number"
                                                value={zone.rows}
                                                onChange={(e) => handleUpdateZone(zone.id, { rows: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#1e1a29] rounded px-2 py-1 mt-1 border border-white/10"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#a59cba] text-xs">Seats/Row</label>
                                            <input
                                                type="number"
                                                value={zone.seatsPerRow}
                                                onChange={(e) => handleUpdateZone(zone.id, { seatsPerRow: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#1e1a29] rounded px-2 py-1 mt-1 border border-white/10"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#a59cba] text-xs">Price ($)</label>
                                            <input
                                                type="number"
                                                value={zone.price}
                                                onChange={(e) => handleUpdateZone(zone.id, { price: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#1e1a29] rounded px-2 py-1 mt-1 border border-white/10"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#a59cba] text-xs">Color</label>
                                            <input
                                                type="color"
                                                value={zone.color}
                                                onChange={(e) => handleUpdateZone(zone.id, { color: e.target.value })}
                                                className="w-full h-8 bg-[#1e1a29] rounded mt-1 cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main - Seat Map Editor */}
                <div className="flex-1 bg-[#1e1a29] rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center min-h-[600px]">
                    {activeZone ? (
                        <>
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold mb-2">Editing: {activeZone.name}</h2>
                                <p className="text-[#a59cba]">Click seats to block/unblock their availability for this layout.</p>
                            </div>
                            <SeatMap
                                zone={activeZone}
                                maxSeats={999} // Unlimited selection for viewing/editing context if needed
                                selectedSeats={[]}
                                onSeatSelect={() => { }}
                                onSeatDeselect={() => { }}
                                onPreviewSeat={() => { }}
                                isEditMode={true}
                                onSaveLayout={handleLayoutSeatsSave}
                            // We could pass initial seats here if we had them stored
                            />
                        </>
                    ) : (
                        <div className="text-[#a59cba] flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-6xl">grid_on</span>
                            <p>Select a zone to configure seat layout</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
