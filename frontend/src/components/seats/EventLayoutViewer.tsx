import React, { useMemo } from 'react';
import { Seat, SeatZone, SelectedSeat } from '../../types/seat';

interface EventLayoutViewerProps {
    zones: SeatZone[];
    selectedSeats: SelectedSeat[];
    onSeatToggle: (seat: SelectedSeat) => void;
}

export const EventLayoutViewer: React.FC<EventLayoutViewerProps> = ({
    zones,
    selectedSeats,
    onSeatToggle,
}) => {
    // Generate seats for a zone with mock status
    const generateSeats = (zone: any): Seat[] => {
        if (zone.type !== 'seats' || !zone.rows || !zone.seatsPerRow) return [];

        const seats: Seat[] = [];
        for (let row = 0; row < zone.rows; row++) {
            for (let num = 0; num < zone.seatsPerRow; num++) {
                // Mock random status for demonstration
                // 15% chance of being occupied (booked)
                // 5% chance of being blocked (locked)
                const rand = Math.random();
                let status: Seat['status'] = 'available';

                if (rand < 0.15) status = 'occupied';
                else if (rand < 0.20) status = 'blocked';

                seats.push({
                    id: `${zone.id}-${row}-${num}`,
                    row: String(row + 1),
                    number: num + 1,
                    zone: zone.name,
                    status: status,
                    price: zone.price
                });
            }
        }
        return seats;
    };

    // Calculate dimensions to ensure all zones fit
    const dimensions = useMemo(() => {
        if (zones.length === 0) return { width: 800, height: 600 };

        let maxX = 0;
        let maxY = 0;

        zones.forEach((zone: any) => {
            const x = zone.position?.x || 0;
            const y = zone.position?.y || 0;
            const w = zone.size?.width || 200;
            const h = zone.size?.height || 150;

            maxX = Math.max(maxX, x + w);
            maxY = Math.max(maxY, y + h);
        });

        return {
            width: Math.max(800, maxX + 100),
            height: Math.max(600, maxY + 100)
        };
    }, [zones]);

    return (
        <div className="w-full h-full overflow-auto bg-[#1e1a29] rounded-xl border border-white/5 relative">
            <div
                className="relative mx-auto my-10"
                style={{
                    width: dimensions.width,
                    height: dimensions.height,
                    minHeight: '500px'
                }}
            >
                {/* Dynamic Zones Rendering */}
                {zones.map((zone: any) => {
                    const x = zone.position?.x ?? 50;
                    const y = zone.position?.y ?? 150;
                    const w = zone.size?.width ?? 150;
                    const h = zone.size?.height ?? 150;

                    // Memoize seat generation to prevent randomization on every render
                    // In a real app, this would come from props/state
                    const zoneSeats = useMemo(() => generateSeats(zone), [zone.id, zone.rows, zone.seatsPerRow]);

                    return (
                        <div
                            key={zone.id}
                            className="absolute transition-all z-10"
                            style={{
                                left: x,
                                top: y,
                                width: w,
                                height: h,
                            }}
                        >
                            <div
                                className="w-full h-full rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden"
                                style={{
                                    borderColor: zone.color,
                                    backgroundColor: `${zone.color}10`,
                                    borderStyle: zone.type === 'barrier' ? 'dashed' : 'solid',
                                }}
                            >
                                {/* Zone Label (Background) */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                                    <span className="font-bold text-center px-1 text-white" style={{ fontSize: 'clamp(8px, 2vw, 14px)' }}>
                                        {zone.name}
                                    </span>
                                    {zone.price > 0 && (
                                        <span className="text-xs font-bold" style={{ color: zone.color }}>
                                            ${zone.price}
                                        </span>
                                    )}
                                </div>

                                {zone.type === 'seats' && zoneSeats.length > 0 ? (
                                    <div
                                        className="grid gap-1 p-2 w-full h-full content-center justify-center"
                                        style={{
                                            gridTemplateColumns: `repeat(${zone.seatsPerRow}, minmax(0, 1fr))`,
                                        }}
                                    >
                                        {zoneSeats.map(seat => {
                                            const isSelected = selectedSeats.some(s => s.id === seat.id);
                                            const isOccupied = seat.status === 'occupied';
                                            const isBlocked = seat.status === 'blocked';
                                            const isInteractive = !isOccupied && !isBlocked;

                                            return (
                                                <div
                                                    key={seat.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isInteractive) {
                                                            onSeatToggle({
                                                                ...seat,
                                                                price: zone.price,
                                                                zone: zone.name,
                                                            } as unknown as SelectedSeat);
                                                        }
                                                    }}
                                                    className={`
                                                        aspect-square rounded-t-lg rounded-b-sm flex items-center justify-center text-[8px] font-bold select-none transition-all
                                                        ${isInteractive ? 'cursor-pointer hover:brightness-125 hover:scale-110' : 'cursor-not-allowed opacity-50'}
                                                        ${isSelected ? 'shadow-[0_0_8px_white] z-10 scale-110' : ''}
                                                    `}
                                                    style={{
                                                        backgroundColor:
                                                            isSelected ? '#ffffff' :
                                                                isOccupied ? '#4b5563' : // Gray for occupied
                                                                    isBlocked ? '#f59e0b' :   // Amber for blocked
                                                                        zone.color,
                                                        color: isSelected ? zone.color : 'white',
                                                        boxShadow: isSelected ? `0 0 10px ${zone.color}` : 'none'
                                                    }}
                                                    title={`Row ${seat.row}, Seat ${seat.number} - ${seat.status}`}
                                                >
                                                    {/* Only show number if seat is big enough, simplified for now */}
                                                    <span className="opacity-90 transform scale-75">
                                                        {seat.number}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : zone.type === 'stage' ? (
                                    // Stage
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#2d2839] to-transparent border-t-4 border-[#8655f6]/50 rounded-t-[50%]">
                                        <span className="text-[#a59cba] font-bold uppercase tracking-[0.3em] text-sm">Stage</span>
                                    </div>
                                ) : (
                                    // General Admission / Standing
                                    <div
                                        className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                                            {zone.type}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
