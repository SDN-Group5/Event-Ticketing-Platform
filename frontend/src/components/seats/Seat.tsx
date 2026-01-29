import React from 'react';
import { Seat as SeatType } from '../../types/seat';

interface SeatProps {
    seat: SeatType;
    isSelected: boolean;
    onSelect: (seat: SeatType) => void;
    onPreview: (seat: SeatType) => void;
    zoneColor: string;
    isEditMode?: boolean;
}

export const Seat: React.FC<SeatProps> = ({
    seat,
    isSelected,
    onSelect,
    onPreview,
    zoneColor,
    isEditMode
}) => {
    const [showTooltip, setShowTooltip] = React.useState(false);

    const getStatusStyle = () => {
        if (seat.status === 'blocked') {
            return {
                backgroundColor: 'transparent',
                border: '1px dashed #4b5563',
                opacity: 0.3,
                cursor: isEditMode ? 'pointer' : 'default'
            };
        }
        if (seat.status === 'occupied') {
            return {
                backgroundColor: '#374151',
                cursor: 'not-allowed',
                opacity: 0.5
            };
        }
        if (isSelected) {
            return {
                backgroundColor: zoneColor,
                boxShadow: `0 0 12px ${zoneColor}80`,
                transform: 'scale(1.1)'
            };
        }
        return {
            backgroundColor: `${zoneColor}30`,
            border: `1px solid ${zoneColor}50`
        };
    };

    const handleClick = () => {
        if (isEditMode) {
            onSelect(seat);
            return;
        }
        if (seat.status !== 'occupied' && seat.status !== 'blocked') {
            onSelect(seat);
        }
    };

    if (seat.status === 'blocked' && !isEditMode) {
        return <div className="w-8 h-8" />; // Invisible spacer in view mode
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                onClick={handleClick}
                disabled={!isEditMode && seat.status === 'occupied'}
                className={`
          w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold
          transition-all duration-200 hover:scale-110
          ${(seat.status === 'occupied' && !isEditMode) ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
                style={getStatusStyle()}
            >
                {seat.status !== 'blocked' && seat.number}
            </button>

            {/* Tooltip */}
            {showTooltip && seat.status !== 'blocked' && seat.status !== 'occupied' && !isEditMode && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-fade-in">
                    <div className="bg-[#1e1a29] border border-white/10 rounded-xl p-3 shadow-2xl min-w-[140px]">
                        <p className="text-white font-bold text-sm mb-1">
                            Row {seat.row} • Seat {seat.number}
                        </p>
                        <p className="text-[#a59cba] text-xs mb-2">${seat.price}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview(seat);
                            }}
                            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-lg text-white text-xs font-medium hover:brightness-110 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">360</span>
                            Preview View
                        </button>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-[#1e1a29] border-r border-b border-white/10 rotate-45" />
                    </div>
                </div>
            )}
        </div>
    );
};
