import React, { useState, useRef, useEffect } from 'react';
import { Seat as SeatType } from '../../types/seat';

interface PanoramaViewerProps {
    seat: SeatType;
    onClose: () => void;
    zoneColor: string;
    zoneName: string;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
    seat,
    onClose,
    zoneColor,
    zoneName
}) => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [autoRotate, setAutoRotate] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-rotate effect
    useEffect(() => {
        if (!autoRotate || isDragging) return;

        const interval = setInterval(() => {
            setRotation(prev => (prev + 0.3) % 360);
        }, 30);

        return () => clearInterval(interval);
    }, [autoRotate, isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
        setAutoRotate(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        setRotation(prev => (prev + deltaX * 0.5) % 360);
        setStartX(e.clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
        setAutoRotate(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        setRotation(prev => (prev + deltaX * 0.5) % 360);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Generate gradient colors based on rotation for 360° effect simulation
    const getBackgroundGradient = () => {
        const hue1 = (rotation * 0.5 + 220) % 360;
        const hue2 = (rotation * 0.5 + 280) % 360;
        const hue3 = (rotation * 0.5 + 200) % 360;

        return `
      radial-gradient(ellipse at 50% 120%, rgba(100,50,200,0.3) 0%, transparent 50%),
      linear-gradient(${rotation}deg, 
        hsl(${hue1}, 30%, 15%) 0%,
        hsl(${hue2}, 40%, 20%) 25%,
        hsl(${hue3}, 35%, 18%) 50%,
        hsl(${hue1}, 30%, 15%) 75%,
        hsl(${hue2}, 40%, 20%) 100%
      )
    `;
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-4xl mx-4">
                {/* Header */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                    <div className="bg-[#1e1a29]/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                                style={{ backgroundColor: `${zoneColor}30`, color: zoneColor }}
                            >
                                {seat.row}{seat.number}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    Row {seat.row} • Seat {seat.number}
                                </h3>
                                <p className="text-[#a59cba] text-sm">{zoneName} • ${seat.price}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-12 h-12 bg-[#1e1a29]/90 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">close</span>
                    </button>
                </div>

                {/* 360° Viewer Container */}
                <div
                    ref={containerRef}
                    className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
                    style={{
                        background: getBackgroundGradient(),
                        perspective: '1000px'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Stage visualization */}
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                            transform: `rotateY(${rotation * 0.1}deg)`,
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {/* Main stage */}
                        <div
                            className="absolute w-[60%] h-32 top-[20%] rounded-t-[50%] flex items-end justify-center pb-4"
                            style={{
                                background: `linear-gradient(to top, ${zoneColor}60, ${zoneColor}20)`,
                                boxShadow: `0 0 60px ${zoneColor}40, inset 0 -20px 40px rgba(0,0,0,0.3)`,
                                transform: `translateZ(50px) rotateX(15deg)`
                            }}
                        >
                            <span className="text-white/80 font-bold uppercase tracking-[0.4em] text-xl">
                                MAIN STAGE
                            </span>
                        </div>

                        {/* Stage lights effect */}
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-20 rounded-full"
                                style={{
                                    background: `linear-gradient(to bottom, ${zoneColor}, transparent)`,
                                    top: '15%',
                                    left: `${20 + i * 15}%`,
                                    opacity: 0.3 + Math.sin((rotation + i * 30) * Math.PI / 180) * 0.3,
                                    transform: `rotateX(20deg) rotateY(${(rotation + i * 20) * 0.2}deg)`,
                                    filter: 'blur(2px)'
                                }}
                            />
                        ))}

                        {/* Crowd silhouettes */}
                        <div className="absolute bottom-[10%] left-0 right-0 h-24 flex items-end justify-center gap-1">
                            {[...Array(30)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-3 rounded-t-full bg-black/40"
                                    style={{
                                        height: `${20 + Math.random() * 30}px`,
                                        opacity: 0.3 + Math.random() * 0.3
                                    }}
                                />
                            ))}
                        </div>

                        {/* Floor reflection */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1/4"
                            style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'
                            }}
                        />
                    </div>

                    {/* 360° Badge */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-white text-sm animate-spin-slow">360</span>
                        <span className="text-white text-xs font-medium">360° View</span>
                    </div>

                    {/* Drag instruction */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-white/70 text-sm">swipe</span>
                        <span className="text-white/70 text-sm">Drag to look around</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-4 flex justify-center gap-4">
                    <button
                        onClick={() => setAutoRotate(!autoRotate)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${autoRotate
                                ? 'bg-white/20 text-white border border-white/20'
                                : 'bg-[#1e1a29] text-white/60 border border-white/10'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">
                            {autoRotate ? 'pause' : 'play_arrow'}
                        </span>
                        <span className="text-sm font-medium">
                            {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
                        </span>
                    </button>

                    <button
                        onClick={() => setRotation(0)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e1a29] text-white/60 border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        <span className="text-sm font-medium">Reset View</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
