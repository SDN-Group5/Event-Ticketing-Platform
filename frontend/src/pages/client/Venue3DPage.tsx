import { useState, useEffect, useMemo } from 'react';
import { Venue3DViewer } from '../../components/venue3d';
import { getAllEventLayouts } from '../../services/layoutService';
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
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedSeatInfo, setSelectedSeatInfo] = useState<SeatInfo | null>(null);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string>('sample');
    const [savedLayouts, setSavedLayouts] = useState<(EventLayout & { id: string, name: string })[]>([]);

    // Load saved layouts from localStorage
    useEffect(() => {
        const layouts = getAllEventLayouts();
        const formattedLayouts = layouts.map(layout => ({
            ...layout,
            id: layout.eventId,
            name: layout.eventName || `Event ${layout.eventId}`,
        }));
        setSavedLayouts(formattedLayouts);

        // Auto-select first saved layout if available
        if (formattedLayouts.length > 0) {
            setSelectedLayoutId(formattedLayouts[0].id);
        }
    }, []);

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

    const handleSeatSelect = (seatId: string, seatInfo: SeatInfo) => {
        setSelectedSeatInfo(seatInfo);
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
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header removed to maximize 3D content space */}

            {/* 3D Viewer */}
            <div style={{ flex: 1, position: 'relative' }}>
                {/* Event Selector Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 10,
                        background: 'rgba(0, 0, 0, 0.6)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: '200px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px' }}>🏟️</span>
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Stage View</span>
                    </div>

                    <label style={{ color: '#a0a0a0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Select Event Layout
                    </label>

                    <div style={{ position: 'relative' }}>
                        <select
                            value={selectedLayoutId}
                            onChange={(e) => setSelectedLayoutId(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                outline: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                appearance: 'none',
                                paddingRight: '30px',
                            }}
                        >
                            <option value="sample" style={{ color: 'black' }}>Sample Layout</option>
                            {savedLayouts.map(layout => (
                                <option key={layout.id} value={layout.id} style={{ color: 'black' }}>
                                    {layout.name}
                                </option>
                            ))}
                        </select>
                        <div style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: 'white',
                            fontSize: '10px'
                        }}>
                            ▼
                        </div>
                    </div>
                </div>

                <Venue3DViewer
                    zones={currentZones}
                    stages={currentStages}
                    isAdmin={isAdmin}
                    bookedSeats={bookedSeats}
                    selectedSeat={selectedSeatInfo?.seatId}
                    onSeatSelect={(id, info) => setSelectedSeatInfo(info)}
                    canvasWidth={canvasSettings.width}
                    canvasHeight={canvasSettings.height}
                    canvasColor={canvasSettings.color}
                />
            </div>

            {/* Legend */}
            <div
                style={{
                    padding: '12px 24px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}
            >
                {legendItems.map((item, index) => (
                    <LegendItem key={index} color={item.color} label={item.label} />
                ))}
                <LegendItem color="#22c55e" label="Selected" />
                <LegendItem color="#6b7280" label="Booked" />
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
                style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: color,
                }}
            />
            <span style={{ color: '#ccc', fontSize: '14px' }}>{label}</span>
        </div>
    );
}
