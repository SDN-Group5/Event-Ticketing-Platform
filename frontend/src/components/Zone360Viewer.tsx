import React, { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

interface Zone360ViewerProps {
    imageUrl: string;
    isOpen: boolean;
    onClose: () => void;
    zoneName?: string;
}

export const Zone360Viewer: React.FC<Zone360ViewerProps> = ({
    imageUrl,
    isOpen,
    onClose,
    zoneName
}) => {
    const viewerContainerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);

    useEffect(() => {
        if (isOpen && viewerContainerRef.current && !viewerRef.current) {
            // Khởi tạo viewer
            viewerRef.current = new Viewer({
                container: viewerContainerRef.current,
                panorama: imageUrl,
                navbar: ['zoom', 'fullscreen'],
                defaultZoomLvl: 50,
                mousewheel: true,
                touchmoveTwoFingers: true,
            });
        }

        // Cleanup khi unmount hoặc đóng modal
        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [isOpen, imageUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div>
                    <h2 className="text-2xl font-bold text-white">360° View</h2>
                    {zoneName && (
                        <p className="text-gray-400 text-sm mt-1">
                            {zoneName} • Drag to look around
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* 360 Viewer Container */}
            <div
                ref={viewerContainerRef}
                className="flex-1 w-full"
                style={{ height: 'calc(100vh - 120px)' }}
            />

            {/* Footer với hints */}
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-center items-center gap-6 text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">pan_tool</span>
                        <span>Drag to rotate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">zoom_in</span>
                        <span>Scroll to zoom</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">fullscreen</span>
                        <span>Click fullscreen for immersive view</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
