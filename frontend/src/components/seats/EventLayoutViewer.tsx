import React, { useMemo } from 'react';
import { Seat, SeatZone, SelectedSeat } from '../../types/seat';
import { SeatData } from '../../services/seatApiService';

interface EventLayoutViewerProps {
    zones: SeatZone[];
    seats?: SeatData[]; // Real seats from MongoDB
    selectedSeats: SelectedSeat[];
    onSeatToggle: (seat: SelectedSeat) => void;
}

export const EventLayoutViewer: React.FC<EventLayoutViewerProps> = ({
    zones,
    seats = [],
    selectedSeats,
    onSeatToggle,
}) => {
    // Map real seats data from MongoDB to UI format
    const getSeatsForZone = (zone: any): Seat[] => {
        if (zone.type !== 'seats' || !zone.rows || !zone.seatsPerRow) return [];

        // If we have real seats data, use it
        if (seats.length > 0) {
            const zoneSeats = seats.filter(s => s.zoneId === zone.id);

            return zoneSeats.map(seatData => ({
                id: `${seatData.zoneId}-${seatData.row}-${seatData.seatNumber}`,
                row: String(seatData.row),
                number: seatData.seatNumber,
                zone: zone.name,
                // Map MongoDB status to UI status
                status: seatData.status === 'sold' || seatData.status === 'reserved'
                    ? 'occupied'
                    : seatData.status === 'blocked'
                        ? 'blocked'
                        : 'available',
                price: seatData.price
            }));
        }

        // Fallback: Generate empty seats if no data from backend
        const fallbackSeats: Seat[] = [];
        for (let row = 0; row < zone.rows; row++) {
            for (let num = 0; num < zone.seatsPerRow; num++) {
                fallbackSeats.push({
                    id: `${zone.id}-${row}-${num}`,
                    row: String(row + 1),
                    number: num + 1,
                    zone: zone.name,
                    status: 'available',
                    price: zone.price
                });
            }
        }
        return fallbackSeats;
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

                    // Memoize seat data to prevent re-mapping on every render
                    const zoneSeats = useMemo(() => getSeatsForZone(zone), [zone.id, zone.rows, zone.seatsPerRow, seats]);

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
                                                                // Giá theo zone: mỗi khu (hàng) có giá riêng (rẻ/đắt)
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
