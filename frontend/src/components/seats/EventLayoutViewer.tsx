import React, { useMemo, useState } from 'react';
import { Seat, SeatZone, SelectedSeat } from '../../types/seat';
import { SeatData } from '../../services/seatApiService';

interface EventLayoutViewerProps {
    zones: SeatZone[];
    seats?: SeatData[];
    selectedSeats: SelectedSeat[];
    onSeatToggle: (seat: SelectedSeat) => void;
}

export const EventLayoutViewer: React.FC<EventLayoutViewerProps> = ({
    zones,
    seats = [],
    selectedSeats,
    onSeatToggle,
}) => {
    const [openZoneId, setOpenZoneId] = useState<string | null>(null);

    // Helper to convert row number to letter (A, B, C... Z, AA, AB...)
    const getRowLetter = (rowNum: number): string => {
        let temp = rowNum;
        let letter = '';
        while (temp > 0) {
            temp--;
            letter = String.fromCharCode(65 + (temp % 26)) + letter;
            temp = Math.floor(temp / 26);
        }
        return letter;
    };

    // Map real seat data from MongoDB to UI format
    const getSeatsForZone = (zone: any): Seat[] => {
        if (zone.type !== 'seats' || !zone.rows || !zone.seatsPerRow) return [];
        if (seats.length > 0) {
            const zoneSeats = seats.filter(s => s.zoneId === zone.id);
            return zoneSeats.map(seatData => ({
                id: `${seatData.zoneId}-${seatData.row}-${seatData.seatNumber}`,
                row: String(seatData.row),
                number: seatData.seatNumber,
                label: `${getRowLetter(seatData.row)}${seatData.seatNumber}`,
                zone: zone.name,
                status: seatData.status === 'sold' || seatData.status === 'reserved'
                    ? 'occupied'
                    : seatData.status === 'blocked' ? 'blocked' : 'available',
                price: seatData.price,
            }));
        }
        const fallbackSeats: Seat[] = [];
        for (let row = 0; row < zone.rows; row++) {
            for (let num = 0; num < zone.seatsPerRow; num++) {
                fallbackSeats.push({
                    id: `${zone.id}-${row}-${num}`,
                    row: String(row + 1),
                    number: num + 1,
                    label: `${getRowLetter(row + 1)}${num + 1}`,
                    zone: zone.name,
                    status: 'available',
                    price: zone.price,
                });
            }
        }
        return fallbackSeats;
    };

    const dimensions = useMemo(() => {
        if (zones.length === 0) return { width: 800, height: 600 };
        let maxX = 0, maxY = 0;
        zones.forEach((zone: any) => {
            const x = zone.position?.x || 0;
            const y = zone.position?.y || 0;
            const w = zone.size?.width || 200;
            const h = zone.size?.height || 150;
            maxX = Math.max(maxX, x + w);
            maxY = Math.max(maxY, y + h);
        });
        return { width: Math.max(800, maxX + 100), height: Math.max(600, maxY + 100) };
    }, [zones]);

    const openZone = openZoneId ? zones.find((z: any) => z.id === openZoneId) : null;
    const openZoneSeats = openZone ? getSeatsForZone(openZone) : [];

    return (
        <div className="w-full h-full overflow-auto bg-[#0f1219] rounded-xl border border-slate-800 relative">
            <div
                className="relative mx-auto my-10"
                style={{ width: dimensions.width, height: dimensions.height, minHeight: '500px' }}
            >
                {zones.map((zone: any) => {
                    const x = zone.position?.x ?? 50;
                    const y = zone.position?.y ?? 150;
                    const w = zone.size?.width ?? 150;
                    const h = zone.size?.height ?? 150;
                    const isSeats = zone.type === 'seats';
                    const selectedInZone = selectedSeats.filter(s => s.id.startsWith(zone.id + '-')).length;

                    return (
                        <div
                            key={zone.id}
                            className={`absolute z-10 ${isSeats ? 'cursor-pointer' : ''}`}
                            style={{
                                left: x, top: y, width: w, height: h,
                                transform: `rotate(${zone.rotation || 0}deg)`,
                            }}
                            onClick={() => {
                                if (isSeats) setOpenZoneId(zone.id);
                            }}
                        >
                            <div
                                className={`w-full h-full border-2 flex flex-col items-center justify-center relative transition-all ${isSeats ? 'hover:brightness-125' : ''
                                    }`}
                                style={{
                                    borderColor: zone.color,
                                    backgroundColor: `${zone.color}15`,
                                    borderStyle: zone.type === 'barrier' ? 'dashed' : 'solid',
                                }}
                            >
                                {/* Screen indicator for stage */}
                                {zone.type === 'stage' && !zone.hideScreen && (
                                    <div
                                        className="absolute top-1.5 w-3/4 h-1 opacity-50 rounded-full"
                                        style={{ backgroundColor: zone.color }}
                                    />
                                )}

                                {/* Zone name */}
                                <span className="font-bold text-sm text-center px-2 leading-tight" style={{ color: zone.color }}>
                                    {zone.name}
                                </span>

                                {/* Subtitle */}
                                {isSeats && zone.rows && zone.seatsPerRow ? (
                                    <span className="text-[11px] text-slate-400 mt-1">
                                        {zone.rows * zone.seatsPerRow} seats
                                    </span>
                                ) : zone.type === 'standing' ? (
                                    <span className="text-[11px] text-slate-400 mt-1">Standing</span>
                                ) : zone.type === 'stage' ? (
                                    <span className="text-[11px] text-slate-400 mt-1">Stage</span>
                                ) : null}

                                {/* Price badge */}
                                {zone.price > 0 && (
                                    <span
                                        className="absolute bottom-1.5 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                                        style={{ color: zone.color, backgroundColor: `${zone.color}20` }}
                                    >
                                        ${zone.price}
                                    </span>
                                )}

                                {/* Selected seats badge */}
                                {selectedInZone > 0 && (
                                    <span
                                        className="absolute top-1.5 right-1.5 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white"
                                        style={{ backgroundColor: zone.color }}
                                    >
                                        {selectedInZone}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Seat Picker Modal */}
            {openZone && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setOpenZoneId(null)}
                >
                    <div
                        className="relative bg-[#0f1219] border border-slate-700 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-white" style={{ color: (openZone as any).color }}>
                                    {(openZone as any).name}
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    {openZoneSeats.filter(s => s.status === 'available').length} available · ${(openZone as any).price}/seat
                                </p>
                            </div>
                            <button
                                onClick={() => setOpenZoneId(null)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: (openZone as any).color }}></span>
                                Available
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-sm inline-block bg-white"></span>
                                Selected
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-sm inline-block bg-[#4b5563]"></span>
                                Occupied
                            </span>
                        </div>

                        {/* Seat Grid */}
                        <div
                            className="grid gap-1"
                            style={{ gridTemplateColumns: `repeat(${(openZone as any).seatsPerRow}, minmax(0, 1fr))` }}
                        >
                            {openZoneSeats.map(seat => {
                                const isSelected = selectedSeats.some(s => s.id === seat.id);
                                const isOccupied = seat.status === 'occupied';
                                const isBlocked = seat.status === 'blocked';
                                const isInteractive = !isOccupied && !isBlocked;

                                return (
                                    <div
                                        key={seat.id}
                                        onClick={() => {
                                            if (isInteractive) {
                                                onSeatToggle({
                                                    ...seat,
                                                    price: (openZone as any).price,
                                                    zone: (openZone as any).name,
                                                } as unknown as SelectedSeat);
                                            }
                                        }}
                                        className={`
                                            aspect-square rounded-t-lg rounded-b-sm flex items-center justify-center text-[11px] font-bold select-none transition-all
                                            ${isInteractive ? 'cursor-pointer hover:brightness-125 hover:scale-110' : 'cursor-not-allowed opacity-40'}
                                            ${isSelected ? 'scale-110 shadow-lg' : ''}
                                        `}
                                        style={{
                                            backgroundColor: isSelected ? '#ffffff' : isOccupied ? '#4b5563' : isBlocked ? '#f59e0b' : (openZone as any).color,
                                            color: isSelected ? (openZone as any).color : 'white',
                                            boxShadow: isSelected ? `0 0 10px ${(openZone as any).color}` : 'none',
                                        }}
                                        title={`Row ${seat.row}, Seat ${seat.number}`}
                                    >
                                        <span className="whitespace-nowrap tracking-tighter sm:tracking-normal">{seat.label || seat.number}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setOpenZoneId(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                                style={{ backgroundColor: (openZone as any).color }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

