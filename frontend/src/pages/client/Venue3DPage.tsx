import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Venue3DViewer } from '../../components/venue3d';
import { LayoutAPI } from '../../services/layoutApiService';
import { SeatAPI } from '../../services/seatApiService';
import { LayoutZone, EventLayout } from '../../types/layout';

// Sample venue data (fallback)
const sampleZones = [
    {
        id: 'z1',
        name: 'VIP Front',
        type: 'vip',
        price: 200,
        color: '#FFD700',
        rows: 3,
        seatsPerRow: 8,
        position: { x: 500, y: 150 },
    },
    {
        id: 'z2',
        name: 'Orchestra Center',
        type: 'regular',
        price: 120,
        color: '#4A90E2',
        rows: 4,
        seatsPerRow: 12,
        position: { x: 500, y: 300 },
    },
    {
        id: 'z3',
        name: 'Balcony',
        type: 'economy',
        price: 50,
        color: '#50E3C2',
        rows: 3,
        seatsPerRow: 15,
        position: { x: 500, y: 450 },
    },
];

// Sample stages (fallback)
const sampleStages = [
    {
        id: 'stage1',
        name: 'Main Stage',
        position: { x: 500, y: 50 },
        size: { width: 300, height: 80 },
        color: '#1a1a2e',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
];

// Sample booked seats
const bookedSeats = [
    'z1-R1-S3',
    'z1-R1-S4',
    'z1-R2-S5',
    'z2-R1-S6',
    'z2-R2-S7',
    'z2-R2-S8',
    'z3-R1-S10',
];

interface SeatInfo {
    seatId: string;
    position: [number, number, number];
    zoneName: string;
    row: number;
    seatNumber: number;
}

// Convert LayoutZone to 3D Zone format with position
function convertLayoutZoneTo3D(zone: LayoutZone) {
    return {
        id: zone.id,
        name: zone.name,
        type: zone.type,
        price: zone.price || 100,
        color: zone.color,
        rows: zone.rows || 5,
        seatsPerRow: zone.seatsPerRow || 10,
        position: zone.position,
        size: zone.size,
        elevation: zone.elevation || 0,
        rotation: zone.rotation || 0,
    };
}

// Convert stage zones to stage format
function convertStageZoneTo3D(zone: LayoutZone) {
    return {
        id: zone.id,
        name: zone.name,
        position: zone.position,
        size: zone.size,
        color: zone.color,
        hideScreen: zone.hideScreen,
        elevation: zone.elevation,
        videoUrl: zone.videoUrl,
        screenHeight: zone.screenHeight,
        screenWidthRatio: zone.screenWidthRatio,
        rotation: zone.rotation || 0,
    };
}

export default function Venue3DPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedSeatInfo, setSelectedSeatInfo] = useState<SeatInfo | null>(null);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string>(id || 'sample');
    const [savedLayouts, setSavedLayouts] = useState<(EventLayout & { id: string, name: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookedSeatsData, setBookedSeatsData] = useState<string[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    // Sidebar and view controls
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showPeople, setShowPeople] = useState(false);
    const [cinematicMode, setCinematicMode] = useState(false);
    const [daylight, setDaylight] = useState(false);

    // Load layouts from MongoDB
    useEffect(() => {
        const fetchLayouts = async () => {
            try {
                setLoading(true);
                setError(null);
                const layouts = await LayoutAPI.getAllLayouts();
                const formattedLayouts = layouts.map(layout => ({
                    ...layout,
                    id: layout.eventId || '',
                    name: layout.eventName || `Event ${layout.eventId}`,
                }));
                setSavedLayouts(formattedLayouts);

                // Auto-select the layout matching the URL id, or first saved layout
                if (id && formattedLayouts.some(l => l.id === id)) {
                    setSelectedLayoutId(id);
                } else if (formattedLayouts.length > 0) {
                    setSelectedLayoutId(formattedLayouts[0].id);
                }
            } catch (err) {
                console.error('Error fetching layouts:', err);
                setError('Failed to load layouts from server. Using sample data.');
            } finally {
                setLoading(false);
            }
        };

        fetchLayouts();
    }, []);

    // Fetch booked seats when layout changes
    useEffect(() => {
        const fetchBookedSeats = async () => {
            if (selectedLayoutId === 'sample') {
                // Use sample booked seats for demo
                setBookedSeatsData(bookedSeats);
                return;
            }

            const layout = savedLayouts.find(l => l.id === selectedLayoutId);
            if (!layout) return;

            try {
                // Get all zone IDs from the layout
                const zoneIds = layout.zones
                    .filter(z => z.type === 'seats' || z.type === 'standing')
                    .map(z => z.id);

                if (zoneIds.length > 0) {
                    const bookedIds = await SeatAPI.getBookedSeatIds(selectedLayoutId, zoneIds);
                    setBookedSeatsData(bookedIds);
                } else {
                    setBookedSeatsData([]);
                }
            } catch (err) {
                console.error('Error fetching booked seats:', err);
                setBookedSeatsData([]);
            }
        };

        fetchBookedSeats();
    }, [selectedLayoutId, savedLayouts]);

    // Get zones and stages for selected layout
    const { currentZones, currentStages } = useMemo(() => {
        if (selectedLayoutId === 'sample') {
            return { currentZones: sampleZones, currentStages: sampleStages };
        }
        const layout = savedLayouts.find(l => l.id === selectedLayoutId);
        if (layout) {
            // Filter seat and standing zones and convert to 3D format
            const zones = layout.zones
                .filter(z => z.type === 'seats' || z.type === 'standing')
                .map(convertLayoutZoneTo3D);

            // Filter stage zones
            const stages = layout.zones
                .filter(z => z.type === 'stage')
                .map(convertStageZoneTo3D);

            return { currentZones: zones, currentStages: stages };
        }
        return { currentZones: sampleZones, currentStages: sampleStages };
    }, [selectedLayoutId, savedLayouts]);

    // Get legend items based on current zones
    const legendItems = useMemo(() => {
        return currentZones.map(zone => ({
            color: zone.color,
            label: `${zone.name} - $${zone.price}`,
        }));
    }, [currentZones]);

    // Calculate total price
    const totalPrice = useMemo(() => {
        if (!selectedSeat) return 0;
        const zone = currentZones.find(z => z.name === selectedSeat.zoneName);
        return zone?.price || 0;
    }, [selectedSeat, currentZones]);

    const handleSeatSelect = (seatId: string, seatInfo: SeatInfo) => {
        // Only allow selecting one seat at a time
        if (selectedSeat?.seatId === seatInfo.seatId) {
            // Deselect if clicking the same seat
            setSelectedSeat(null);
            setSelectedSeatInfo(null);
            setIsLocked(false);
        } else {
            // Select new seat (replace previous selection)
            setSelectedSeat(seatInfo);
            setSelectedSeatInfo(seatInfo);
            setIsLocked(false); // Reset lock when selecting new seat
        }

        console.log('Seat selected:', seatId, seatInfo);
    };

    // Get canvas settings
    const canvasSettings = useMemo(() => {
        if (selectedLayoutId === 'sample') {
            return { width: 800, height: 600, color: '#1a1a1a' };
        }
        const layout = savedLayouts.find(l => l.id === selectedLayoutId);
        return {
            width: layout?.canvasWidth || 800,
            height: layout?.canvasHeight || 600,
            color: layout?.canvasColor || '#1a1a1a',
        };
    }, [selectedLayoutId, savedLayouts]);

    return (
        <div className="h-screen overflow-hidden bg-[#151022] text-white flex flex-col">
            {/* Back Button - Top Left */}
            <div className="absolute top-6 left-6 z-30">
                <button
                    onClick={() => id ? navigate(`/event/${id}`) : navigate('/')}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-colors border border-white/10"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            {/* Sidebar Toggle Button */}
            <div className="absolute top-6 left-20 z-30">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`w-12 h-12 flex items-center justify-center rounded-full backdrop-blur transition-all duration-300 border ${sidebarOpen ? 'bg-white/10 text-white border-white/20' : 'bg-black/40 text-gray-200 border-white/10 hover:bg-black/60 hover:text-white'}`}
                    title={sidebarOpen ? 'Close controls' : 'Open view controls'}
                >
                    <span className="material-symbols-outlined transition-transform duration-300">
                        {sidebarOpen ? 'close' : 'tune'}
                    </span>
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100,
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '24px 48px',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold'
                }}>
                    ⏳ Loading venue data...
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    background: 'rgba(239, 68, 68, 0.9)',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* 3D Viewer */}
            <div className="flex-1 relative flex">
                {/* Collapsible Left Sidebar */}
                <div className={`absolute left-6 top-24 z-20 transition-all duration-300 ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
                    <div className="bg-[#1e1a29]/90 backdrop-blur border border-white/10 rounded-xl p-4 min-w-[220px] space-y-4">
                        {/* View Controls Section */}
                        <div>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span>👁️</span>
                                View Controls
                            </h3>
                            <div className="space-y-2">
                                {/* Daylight Toggle */}
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{daylight ? '☀️' : '🌙'}</span>
                                        <span className="text-xs font-medium">Daylight</span>
                                    </div>
                                    <button
                                        onClick={() => setDaylight(!daylight)}
                                        className={`relative w-10 h-5 rounded-full transition-all duration-300 ${daylight ? 'bg-blue-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${daylight ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {/* Cinematic Mode Toggle */}
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🎬</span>
                                        <span className="text-xs font-medium">Cinematic</span>
                                    </div>
                                    <button
                                        onClick={() => setCinematicMode(!cinematicMode)}
                                        className={`relative w-10 h-5 rounded-full transition-all duration-300 ${cinematicMode ? 'bg-purple-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${cinematicMode ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {/* Show People Toggle */}
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🧍</span>
                                        <span className="text-xs font-medium">Show People</span>
                                    </div>
                                    <button
                                        onClick={() => setShowPeople(!showPeople)}
                                        className={`relative w-10 h-5 rounded-full transition-all duration-300 ${showPeople ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${showPeople ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Zones Legend Section */}
                        <div className="border-t border-white/10 pt-4">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span>🎭</span>
                                Zones & Pricing
                            </h3>
                            <div className="space-y-2">
                                {legendItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-xs">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3D Canvas Container - Full Screen */}
                <div className="flex-1 relative">
                    <Venue3DViewer
                        zones={currentZones}
                        stages={currentStages}
                        isAdmin={isAdmin}
                        bookedSeats={bookedSeatsData}
                        selectedSeat={selectedSeatInfo?.seatId}
                        onSeatSelect={handleSeatSelect}
                        canvasWidth={canvasSettings.width}
                        canvasHeight={canvasSettings.height}
                        canvasColor={canvasSettings.color}
                        showPeople={showPeople}
                        daylight={daylight}
                        cinematicMode={cinematicMode}
                    />
                </div>
            </div>

            {/* Bottom Control Bar - Always Visible */}
            <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-[1600px] mx-auto px-4 py-3">
                    <div className="flex justify-between items-center gap-4">
                        {/* Left: Event Selector & Reload */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-white/60 uppercase font-bold">Layout:</span>
                            <select
                                value={selectedLayoutId}
                                onChange={(e) => setSelectedLayoutId(e.target.value)}
                                className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-lg text-sm outline-none cursor-pointer hover:bg-white/15 transition-colors"
                            >
                                <option value="sample" style={{ color: 'black' }}>Sample Layout</option>
                                {savedLayouts.map(layout => (
                                    <option key={layout.id} value={layout.id} style={{ color: 'black' }}>
                                        {layout.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => window.location.reload()}
                                className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1.5 rounded-lg text-xs hover:bg-green-500/30 transition-colors flex items-center gap-1"
                                title="Reload data from server"
                            >
                                <span>🔄</span>
                                Reload
                            </button>
                        </div>

                        {/* Center: Selected Seat Info (if any) */}
                        {selectedSeat && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#8655f6]/80 to-[#a855f7]/80 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">event_seat</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/60 font-bold">
                                            {selectedSeat.zoneName} • R{selectedSeat.row} • S{selectedSeat.seatNumber}
                                        </p>
                                    </div>
                                </div>

                                <div className="h-6 w-px bg-white/20"></div>

                                <div>
                                    <p className="text-xs text-white/60">Price:</p>
                                    <p className="text-lg font-black text-[#8655f6]">${totalPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* 2D View Button */}
                            <button
                                onClick={() => id && navigate(`/event/${id}/zones`)}
                                className="bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 border border-white/10 text-sm"
                            >
                                <span className="material-symbols-outlined text-base">view_in_ar</span>
                                <span>2D View</span>
                            </button>

                            {/* Lock Toggle (only if seat selected) */}
                            {selectedSeat && (
                                <>
                                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
                                        <p className="text-xs font-bold">{isLocked ? '🔒' : '🔓'}</p>
                                        <button
                                            onClick={() => setIsLocked(!isLocked)}
                                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isLocked
                                                ? 'bg-gradient-to-r from-[#8655f6] to-[#a855f7]'
                                                : 'bg-gray-600/50'
                                                }`}
                                        >
                                            <div
                                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${isLocked ? 'right-0.5' : 'left-0.5'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Checkout Button - Only when locked */}
                                    {isLocked && (
                                        <button
                                            onClick={() => {
                                                if (id && selectedSeat) {
                                                    navigate('/checkout', {
                                                        state: {
                                                            eventId: id,
                                                            seats: [selectedSeat],
                                                            total: totalPrice,
                                                            ticketCount: 1,
                                                            zone: {
                                                                name: selectedSeat.zoneName,
                                                                type: 'seats', // Default type
                                                                price: totalPrice
                                                            }
                                                        }
                                                    });
                                                }
                                            }}
                                            className="bg-gradient-to-r from-[#8655f6] to-[#a855f7] text-white font-bold py-1.5 px-4 rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 text-sm"
                                        >
                                            <span className="material-symbols-outlined text-base">shopping_cart</span>
                                            <span>Checkout</span>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
