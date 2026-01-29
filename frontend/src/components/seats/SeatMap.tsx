import React, { useMemo } from 'react';
import { Seat as SeatType, SeatZone, SelectedSeat } from '../../types/seat';
import { Seat } from './Seat';

interface SeatMapProps {
    zone: SeatZone;
    maxSeats: number;
    selectedSeats: SelectedSeat[];
    onSeatSelect: (seat: SelectedSeat) => void;
    onSeatDeselect: (seatId: string) => void;
    onPreviewSeat: (seat: SeatType) => void;
}

export const SeatMap: React.FC<SeatMapProps & {
    isEditMode?: boolean;
    initialSeats?: SeatType[];
    onSaveLayout?: (seats: SeatType[]) => void;
}> = ({
    zone,
    maxSeats,
    selectedSeats,
    onSeatSelect,
    onSeatDeselect,
    onPreviewSeat,
    isEditMode = false,
    initialSeats,
    onSaveLayout
}) => {
        // Local state for seats to support editing
        const [localSeats, setLocalSeats] = React.useState<SeatType[]>([]);

        // Initialize seats
        React.useEffect(() => {
            if (initialSeats && initialSeats.length > 0) {
                setLocalSeats(initialSeats);
            } else {
                // Generate seats if no initial data provided
                const generatedSeats: SeatType[] = [];
                const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

                for (let r = 0; r < zone.rows; r++) {
                    for (let s = 1; s <= zone.seatsPerRow; s++) {
                        const seatId = `${zone.id}-${rowLabels[r]}${s}`;
                        // Only simulate occupation if NOT in edit mode and creating fresh
                        const isOccupied = !isEditMode && Math.random() < 0.15;

                        generatedSeats.push({
                            id: seatId,
                            row: rowLabels[r],
                            number: s,
                            zone: zone.id,
                            status: isOccupied ? 'occupied' : 'available',
                            price: zone.price,
                            panoramaUrl: `/panorama/${zone.id}-${rowLabels[r]}.jpg`
                        });
                    }
                }
                setLocalSeats(generatedSeats);
            }
        }, [zone, initialSeats, isEditMode]);

        const handleSeatClick = (seat: SeatType) => {
            if (isEditMode) {
                // In edit mode, toggle availability/blocking
                const updatedSeats = localSeats.map(s => {
                    if (s.id === seat.id) {
                        return {
                            ...s,
                            status: s.status === 'blocked' ? 'available' : 'blocked'
                        } as SeatType;
                    }
                    return s;
                });
                setLocalSeats(updatedSeats);
                return;
            }

            const isSelected = selectedSeats.some(s => s.id === seat.id);

            if (isSelected) {
                onSeatDeselect(seat.id);
            } else {
                if (selectedSeats.length < maxSeats) {
                    onSeatSelect({
                        id: seat.id,
                        row: seat.row,
                        number: seat.number,
                        zone: seat.zone,
                        price: seat.price
                    });
                }
            }
        };

        // Group seats by row
        const seatsByRow = useMemo((): Record<string, SeatType[]> => {
            const grouped: Record<string, SeatType[]> = {};
            localSeats.forEach(seat => {
                if (!grouped[seat.row]) {
                    grouped[seat.row] = [];
                }
                grouped[seat.row].push(seat);
            });
            return grouped;
        }, [localSeats]);

        const handleSave = () => {
            if (onSaveLayout) {
                onSaveLayout(localSeats);
            }
        };

        return (
            <div className="flex flex-col items-center gap-4">
                {/* Stage indicator */}
                <div className="w-full max-w-md h-12 bg-gradient-to-b from-[#2d2839] to-transparent border-t-4 border-gray-600 rounded-t-[50%] flex items-center justify-center mb-6">
                    <span className="text-gray-500 font-bold uppercase tracking-[0.3em] text-sm">Stage</span>
                </div>

                {/* Controls for Edit Mode */}
                {isEditMode && (
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                            Save Layout
                        </button>
                        <div className="text-sm text-gray-400 flex items-center">
                            Click seats to toggle visibility
                        </div>
                    </div>
                )}

                {/* Seat selection info */}
                {!isEditMode && (
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: `${zone.color}30`, border: `1px solid ${zone.color}50` }} />
                            <span className="text-xs text-gray-400">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }} />
                            <span className="text-xs text-gray-400">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-600 opacity-50" />
                            <span className="text-xs text-gray-400">Occupied</span>
                        </div>
                    </div>
                )}

                {/* Selection counter (Booking Mode) */}
                {!isEditMode && (
                    <div className="bg-[#1e1a29] rounded-full px-4 py-2 flex items-center gap-2 mb-4">
                        <span className="text-[#a59cba] text-sm">Selected:</span>
                        <span className="font-bold" style={{ color: zone.color }}>
                            {selectedSeats.length} / {maxSeats}
                        </span>
                    </div>
                )}

                {/* Seat grid */}
                <div className="bg-[#1e1a29]/50 rounded-2xl p-6 border border-white/5">
                    {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                        <div key={row} className="flex items-center gap-2 mb-2">
                            {/* Row label */}
                            <div className="w-6 h-8 flex items-center justify-center text-gray-500 font-bold text-sm">
                                {row}
                            </div>

                            {/* Seats */}
                            <div className="flex gap-1.5">
                                {rowSeats.map(seat => (
                                    <Seat
                                        key={seat.id}
                                        seat={seat}
                                        isSelected={selectedSeats.some(s => s.id === seat.id)}
                                        onSelect={handleSeatClick}
                                        onPreview={isEditMode ? () => { } : onPreviewSeat}
                                        zoneColor={zone.color}
                                        isEditMode={isEditMode}
                                    />
                                ))}
                            </div>

                            {/* Row label (right side) */}
                            <div className="w-6 h-8 flex items-center justify-center text-gray-500 font-bold text-sm">
                                {row}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selected seats summary (Booking Mode) */}
                {!isEditMode && selectedSeats.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {selectedSeats.map(seat => (
                            <div
                                key={seat.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                                style={{ backgroundColor: `${zone.color}20`, border: `1px solid ${zone.color}50` }}
                            >
                                <span style={{ color: zone.color }}>Row {seat.row} • Seat {seat.number}</span>
                                <button
                                    onClick={() => onSeatDeselect(seat.id)}
                                    className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <span className="text-[10px]">✕</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };
