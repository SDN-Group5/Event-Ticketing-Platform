import { useState, useEffect, useMemo } from 'react';
import { Venue3DViewer } from '../../components/venue3d';
import { getAllEventLayouts } from '../../services/layoutService';
import { LayoutZone } from '../../types/layout';

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
    };
}

export default function Venue3DPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedSeatInfo, setSelectedSeatInfo] = useState<SeatInfo | null>(null);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string>('sample');
    const [savedLayouts, setSavedLayouts] = useState<{ id: string; name: string; zones: LayoutZone[] }[]>([]);

    // Load saved layouts from localStorage
    useEffect(() => {
        const layouts = getAllEventLayouts();
        const formattedLayouts = layouts.map(layout => ({
            id: layout.eventId,
            name: layout.eventName || `Event ${layout.eventId}`,
            zones: layout.zones,
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

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                background: '#0a0a0a',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '16px 24px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: 'bold',
                        }}
                    >
                        🎭 3D Venue Viewer
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>
                        Interactive concert hall seat selection
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Layout selector */}
                    <select
                        value={selectedLayoutId}
                        onChange={(e) => setSelectedLayoutId(e.target.value)}
                        style={{
                            background: '#1a1a2e',
                            color: 'white',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="sample">Sample Layout</option>
                        {savedLayouts.map(layout => (
                            <option key={layout.id} value={layout.id}>
                                {layout.name}
                            </option>
                        ))}
                    </select>

                    {/* Selected seat info */}
                    {selectedSeatInfo && (
                        <div
                            style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid #22c55e',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                color: 'white',
                            }}
                        >
                            <span style={{ fontWeight: 'bold' }}>
                                {selectedSeatInfo.zoneName}
                            </span>{' '}
                            - Row {selectedSeatInfo.row}, Seat {selectedSeatInfo.seatNumber}
                        </div>
                    )}

                    {/* Admin toggle */}
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span>Admin Mode</span>
                    </label>
                </div>
            </div>

            {/* 3D Viewer */}
            <div style={{ flex: 1, position: 'relative' }}>
                {currentZones.length > 0 ? (
                    <Venue3DViewer
                        zones={currentZones}
                        stages={currentStages}
                        isAdmin={isAdmin}
                        bookedSeats={bookedSeats}
                        onSeatSelect={handleSeatSelect}
                    />
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#888',
                            fontSize: '18px',
                        }}
                    >
                        No seat zones found in this layout
                    </div>
                )}
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
