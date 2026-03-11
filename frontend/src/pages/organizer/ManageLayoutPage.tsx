import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import { EventAPI } from '../../services/eventApiService';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../contexts/AuthContext';
import type { EventLayout, LayoutZone } from '../../types/layout';

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

type ZoneType = 'seats' | 'standing' | 'stage' | 'exit' | 'barrier' | 'spotlight';

interface Zone extends LayoutZone {
    position: Position;
    size: Size;
    rotation?: number;
    rows?: number;
    seatsPerRow?: number;
    price?: number;
}

type ToolType = 'select' | 'seats' | 'standing' | 'stage' | 'exit';

const COLORS = ['#8655f6', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
const TOOLS: { type: ToolType; label: string; icon: string }[] = [
    { type: 'select', label: 'Select', icon: 'arrow_selector_tool' },
    { type: 'seats', label: 'Seat Section', icon: 'event_seat' },
    { type: 'standing', label: 'Standing Area', icon: 'crop_square' },
    { type: 'stage', label: 'Stage', icon: 'mic' },
];

const generateId = () => `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const SEAT_UNIT_2D = 32; // 32px per unit

export const ManageLayoutPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const canvasRef = useRef<HTMLDivElement>(null);

    // State
    const [event, setEvent] = useState<any>(null);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedTool, setSelectedTool] = useState<ToolType>('select');
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [history, setHistory] = useState<Zone[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [canvasSize, setCanvasSize] = useState<Size>({ width: 800, height: 600 });
    const [canvasColor, setCanvasColor] = useState('#0f1219');

    // Load layout
    useEffect(() => {
        const loadLayout = async () => {
            try {
                if (!eventId) return;

                // Load layout
                const layoutData = await LayoutAPI.getLayout(eventId);
                const convertedZones = layoutData.zones as Zone[];
                setZones(convertedZones);
                setHistory([convertedZones]);
                setHistoryIndex(0);

                if (layoutData.canvasWidth && layoutData.canvasHeight) {
                    setCanvasSize({ width: layoutData.canvasWidth, height: layoutData.canvasHeight });
                }
                if (layoutData.canvasColor) {
                    setCanvasColor(layoutData.canvasColor);
                }
            } catch (err: any) {
                console.error('Error loading layout:', err);
                if (err.response?.status === 404) {
                    showToast('New layout created', 'info');
                    setZones([]);
                    setHistory([[]]);
                } else {
                    showToast('Failed to load layout', 'error');
                }
            }

            // Load event separately
            try {
                if (!eventId) return;
                const eventData = await EventAPI.getEventById(eventId);
                setEvent(eventData);
            } catch (err: any) {
                console.error('Error loading event:', err);
                showToast('Event not found', 'error');
                setTimeout(() => navigate('/organizer'), 2000);
            } finally {
                setLoading(false);
            }
        };

        loadLayout();
    }, [eventId]);

    const selectedZone = zones.find(z => z.id === selectedZoneId) as Zone | undefined;
    const currentZones = history[historyIndex] || zones;

    const addToHistory = useCallback((newZones: Zone[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newZones);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setZones(newZones);
    }, [history, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setZones(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setZones(history[historyIndex + 1]);
        }
    }, [history, historyIndex]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redo();
            }
            if (e.key === 'Delete' && selectedZoneId) {
                deleteZone(selectedZoneId);
            }
            if (e.key === 'Escape') {
                setSelectedZoneId(null);
                setSelectedTool('select');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, selectedZoneId]);

    // Canvas click handler
    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (selectedTool === 'select') return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left) / (zoom / 100);
        const y = (e.clientY - rect.top) / (zoom / 100);

        let width = 150;
        let height = 80;
        let rows: number | undefined;
        let seatsPerRow: number | undefined;

        if (selectedTool === 'seats') {
            rows = 4;
            seatsPerRow = 8;
            width = seatsPerRow * SEAT_UNIT_2D;
            height = rows * SEAT_UNIT_2D;
        }

        const newZone: Zone = {
            id: generateId(),
            name: `New ${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}`,
            type: selectedTool as ZoneType,
            position: { x: x - width / 2, y: y - height / 2 },
            size: { width, height },
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rows,
            seatsPerRow,
            price: selectedTool === 'stage' ? undefined : 50,
        };

        const newZones = [...zones, newZone];
        addToHistory(newZones);
        setSelectedZoneId(newZone.id);
        setSelectedTool('select');
    };

    const handleZoneMouseDown = (e: React.MouseEvent, zoneId: string) => {
        e.stopPropagation();
        if (selectedTool !== 'select') return;

        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        setSelectedZoneId(zoneId);
        setIsDragging(true);

        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: (e.clientX - rect.left) / (zoom / 100) - zone.position.x,
                y: (e.clientY - rect.top) / (zoom / 100) - zone.position.y,
            });
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent, zoneId: string, handle: string) => {
        e.stopPropagation();
        setSelectedZoneId(zoneId);
        setIsResizing(true);
        setResizeHandle(handle);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / (zoom / 100);
        const y = (e.clientY - rect.top) / (zoom / 100);

        if (isDragging && selectedZoneId) {
            setZones(zones.map(z => {
                if (z.id !== selectedZoneId) return z;
                const snappedX = Math.round((x - dragOffset.x) / 10) * 10;
                const snappedY = Math.round((y - dragOffset.y) / 10) * 10;
                return { ...z, position: { x: snappedX, y: snappedY } };
            }));
        }

        if (isResizing && selectedZoneId && resizeHandle) {
            setZones(zones.map(z => {
                if (z.id !== selectedZoneId) return z;

                let newWidth = z.size.width;
                let newHeight = z.size.height;
                let newX = z.position.x;
                let newY = z.position.y;

                const snappedX = Math.round(x / 10) * 10;
                const snappedY = Math.round(y / 10) * 10;

                if (resizeHandle.includes('e')) newWidth = Math.max(60, snappedX - z.position.x);
                if (resizeHandle.includes('w')) {
                    const deltaX = z.position.x - snappedX;
                    newWidth = Math.max(60, z.size.width + deltaX);
                    newX = snappedX;
                }
                if (resizeHandle.includes('s')) newHeight = Math.max(40, snappedY - z.position.y);
                if (resizeHandle.includes('n')) {
                    const deltaY = z.position.y - snappedY;
                    newHeight = Math.max(40, z.size.height + deltaY);
                    newY = snappedY;
                }

                return { ...z, position: { x: newX, y: newY }, size: { width: newWidth, height: newHeight } };
            }));
        }
    };

    const handleMouseUp = () => {
        if (isDragging || isResizing) {
            addToHistory([...zones]);
        }
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    };

    const deleteZone = (zoneId: string) => {
        const newZones = zones.filter(z => z.id !== zoneId);
        addToHistory(newZones);
        setSelectedZoneId(null);
    };

    const updateZone = (zoneId: string, updates: Partial<Zone>) => {
        let finalUpdates = { ...updates };
        const zone = zones.find(z => z.id === zoneId);

        if (zone && zone.type === 'seats' && (updates.rows !== undefined || updates.seatsPerRow !== undefined)) {
            const newRows = updates.rows !== undefined ? updates.rows : (zone.rows || 4);
            const newSeatsPerRow = updates.seatsPerRow !== undefined ? updates.seatsPerRow : (zone.seatsPerRow || 8);
            finalUpdates.size = {
                width: newSeatsPerRow * SEAT_UNIT_2D,
                height: newRows * SEAT_UNIT_2D
            };
        }

        const newZones = zones.map(z => z.id === zoneId ? { ...z, ...finalUpdates } : z);
        addToHistory(newZones);
    };

    const duplicateZone = (zoneId: string) => {
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        const newZone: Zone = {
            ...zone,
            id: generateId(),
            name: `${zone.name} (Copy)`,
            position: { x: zone.position.x + 20, y: zone.position.y + 20 },
        };

        addToHistory([...zones, newZone]);
        setSelectedZoneId(newZone.id);
    };

    const saveLayout = async () => {
        if (!eventId) return;

        setSaving(true);
        try {
            const layoutData = {
                eventId,
                eventName: event?.name || event?.eventName || event?.title || eventId,
                zones: zones,
                canvasWidth: canvasSize.width,
                canvasHeight: canvasSize.height,
                canvasColor: canvasColor,
            };

            try {
                await LayoutAPI.updateLayout(eventId, layoutData);
                showToast('Layout updated successfully', 'success');
            } catch (err: any) {
                if (err.response?.status === 404) {
                    await LayoutAPI.createLayout(layoutData);
                    showToast('Layout created successfully', 'success');
                } else {
                    throw err;
                }
            }
        } catch (err: any) {
            console.error('Error saving layout:', err);
            showToast('Failed to save layout', 'error');
        } finally {
            setSaving(false);
        }
    };

    const renderZone = (zone: Zone) => {
        const isSelected = selectedZoneId === zone.id;
        return (
            <div
                key={zone.id}
                className={`absolute transition-shadow cursor-move ${isSelected ? 'z-20' : 'z-10'}`}
                style={{
                    left: zone.position.x,
                    top: zone.position.y,
                    width: zone.size.width,
                    height: zone.size.height,
                }}
                onMouseDown={(e) => handleZoneMouseDown(e, zone.id)}
            >
                <div
                    className={`w-full h-full border-2 transition-all flex flex-col items-center justify-center ${
                        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f1219]' : ''
                    }`}
                    style={{
                        borderColor: zone.color,
                        backgroundColor: `${zone.color}15`,
                    }}
                >
                    <span className="font-bold text-xs" style={{ color: zone.color }}>
                        {zone.name}
                    </span>
                    {zone.type === 'seats' && zone.rows && zone.seatsPerRow && (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                            {zone.rows * zone.seatsPerRow} seats
                        </span>
                    )}
                </div>

                {isSelected && selectedTool === 'select' && zone.type !== 'seats' && (
                    <>
                        {['nw', 'ne', 'sw', 'se'].map(handle => (
                            <div
                                key={handle}
                                className="absolute w-3 h-3 bg-white rounded-full border-2 border-[#8655f6] cursor-nwse-resize z-30"
                                style={{
                                    left: handle.includes('w') ? -6 : 'auto',
                                    right: handle.includes('e') ? -6 : 'auto',
                                    top: handle.includes('n') ? -6 : 'auto',
                                    bottom: handle.includes('s') ? -6 : 'auto',
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, zone.id, handle)}
                            />
                        ))}
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white flex">
            {/* Sidebar */}
            <aside className="w-72 hidden lg:flex flex-col p-5 bg-[#0f1219] border-r border-slate-800 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold">Manage Layout</h2>
                        <p className="text-xs text-gray-400 mt-1">{event?.name || event?.eventName || eventId}</p>
                    </div>
                </div>

                {/* Tools */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Tools</h3>
                    <div className="space-y-1">
                        {TOOLS.map(tool => (
                            <button
                                key={tool.type}
                                onClick={() => setSelectedTool(tool.type)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    selectedTool === tool.type
                                        ? 'bg-[#8655f6]/20 text-[#8655f6] border border-[#8655f6]/30'
                                        : 'text-slate-400 hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tool.icon}</span>
                                {tool.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-30"
                    >
                        <span className="material-symbols-outlined text-sm">undo</span>
                    </button>
                    <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-30"
                    >
                        <span className="material-symbols-outlined text-sm">redo</span>
                    </button>
                </div>

                {/* Zone Properties */}
                {selectedZone && (
                    <div className="border-t border-slate-800 pt-5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Zone Properties</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase mb-1.5 block">Name</label>
                                <input
                                    value={selectedZone.name}
                                    onChange={(e) => updateZone(selectedZone.id, { name: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-[#8655f6] focus:ring-1 focus:ring-[#8655f6]/30"
                                />
                            </div>

                            {selectedZone.type === 'seats' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase mb-1.5 block">Rows</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={selectedZone.rows || 4}
                                                onChange={(e) => updateZone(selectedZone.id, { rows: parseInt(e.target.value) || 4 })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase mb-1.5 block">Seats/Row</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={selectedZone.seatsPerRow || 8}
                                                onChange={(e) => updateZone(selectedZone.id, { seatsPerRow: parseInt(e.target.value) || 8 })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-800/30 rounded-lg">
                                        <p className="text-xs text-slate-400">
                                            Total: <span className="font-bold text-white">{(selectedZone.rows || 0) * (selectedZone.seatsPerRow || 0)} seats</span>
                                        </p>
                                    </div>
                                </>
                            )}

                            {selectedZone.price !== undefined && (
                                <div>
                                    <label className="text-xs text-slate-500 uppercase mb-1.5 block">Price (đ)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={selectedZone.price}
                                        onChange={(e) => updateZone(selectedZone.id, { price: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-slate-500 uppercase mb-1.5 block">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateZone(selectedZone.id, { color })}
                                            className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                                                selectedZone.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f1219]' : ''
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => duplicateZone(selectedZone.id)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600"
                                >
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                    Duplicate
                                </button>
                                <button
                                    onClick={() => deleteZone(selectedZone.id)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-rose-500/10 text-rose-400 rounded-lg text-sm hover:bg-rose-500/20"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedZone && (
                    <div className="mt-auto pt-4 border-t border-slate-800">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Canvas Settings</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 uppercase mb-1.5 block">Width</label>
                                <input
                                    type="number"
                                    value={canvasSize.width}
                                    onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase mb-1.5 block">Height</label>
                                <input
                                    type="number"
                                    value={canvasSize.height}
                                    onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={saveLayout}
                    disabled={saving}
                    className="w-full mt-6 px-4 py-3 bg-[#8655f6] hover:bg-[#7644e0] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                    {saving ? 'Saving...' : 'Save Layout'}
                </button>
            </aside>

            {/* Main Canvas */}
            <main className="flex-1 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a0c10]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/organizer/events')}
                            className="text-[#8655f6] hover:text-[#7644e0] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Layout Editor</h1>
                            <p className="text-xs text-gray-400">{zones.length} zones</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400 flex items-center gap-2">
                            Zoom:
                            <input
                                type="range"
                                min="50"
                                max="200"
                                value={zoom}
                                onChange={(e) => setZoom(parseInt(e.target.value))}
                                className="w-24"
                            />
                            {zoom}%
                        </label>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div
                        ref={canvasRef}
                        className="relative bg-contain mx-auto cursor-crosshair"
                        style={{
                            width: canvasSize.width,
                            height: canvasSize.height,
                            backgroundColor: canvasColor,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top left',
                            backgroundSize: '20px 20px',
                            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent),
                                           linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)`
                        }}
                        onClick={handleCanvasClick}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {zones.map(zone => renderZone(zone))}
                    </div>
                </div>
            </main>
        </div>
    );
};
