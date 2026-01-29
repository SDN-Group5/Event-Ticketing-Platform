import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveEventLayout, getEventLayout } from '../../services/layoutService';
import { LayoutZone } from '../../types/layout';
import eventsData from '../../data/events.json';

// Types
interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

type ZoneType = 'seats' | 'standing' | 'stage' | 'exit' | 'barrier';

interface Zone {
    id: string;
    name: string;
    type: ZoneType;
    position: Position;
    size: Size;
    color: string;
    rows?: number;
    seatsPerRow?: number;
    price?: number;
}

interface Seat {
    id: string;
    row: number;
    number: number;
    zoneId: string;
    status: 'available' | 'reserved' | 'sold';
}

type ToolType = 'select' | 'seats' | 'standing' | 'stage' | 'exit' | 'barrier';

const COLORS = ['#8655f6', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

const TOOLS: { type: ToolType; label: string; icon: string }[] = [
    { type: 'select', label: 'Select', icon: 'arrow_selector_tool' },
    { type: 'seats', label: 'Seat Section', icon: 'event_seat' },
    { type: 'standing', label: 'Standing Area', icon: 'crop_square' },
    { type: 'stage', label: 'Stage', icon: 'mic' },
    { type: 'exit', label: 'Exit', icon: 'meeting_room' },
    { type: 'barrier', label: 'Barrier', icon: 'fence' },
];

// Generate unique ID
const generateId = () => `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial zones
const initialZones: Zone[] = [
    { id: 'stage-1', name: 'Main Stage', type: 'stage', position: { x: 250, y: 20 }, size: { width: 300, height: 60 }, color: '#64748b' },
    { id: 'vip-1', name: 'VIP Section A', type: 'seats', position: { x: 275, y: 120 }, size: { width: 250, height: 100 }, color: '#8655f6', rows: 5, seatsPerRow: 10, price: 150 },
    { id: 'section-b', name: 'Section B', type: 'seats', position: { x: 100, y: 260 }, size: { width: 180, height: 80 }, color: '#3b82f6', rows: 4, seatsPerRow: 8, price: 80 },
    { id: 'section-c', name: 'Section C', type: 'seats', position: { x: 520, y: 260 }, size: { width: 180, height: 80 }, color: '#3b82f6', rows: 4, seatsPerRow: 8, price: 80 },
    { id: 'standing-1', name: 'General Standing', type: 'standing', position: { x: 275, y: 380 }, size: { width: 250, height: 100 }, color: '#22c55e', price: 45 },
];

export const LayoutEditorPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLDivElement>(null);

    // Event selection state
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // State
    const [zones, setZones] = useState<Zone[]>(initialZones);
    const [selectedTool, setSelectedTool] = useState<ToolType>('select');
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [history, setHistory] = useState<Zone[][]>([initialZones]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [showSeatGrid, setShowSeatGrid] = useState(false);
    const [isSaved, setIsSaved] = useState(true);

    // Load existing layout when event is selected
    useEffect(() => {
        if (selectedEventId) {
            const existingLayout = getEventLayout(selectedEventId);
            if (existingLayout) {
                setZones(existingLayout.zones as Zone[]);
                setHistory([existingLayout.zones as Zone[]]);
                setHistoryIndex(0);
                setIsSaved(true);
            } else {
                // Reset to initial zones for new event
                setZones(initialZones);
                setHistory([initialZones]);
                setHistoryIndex(0);
                setIsSaved(false);
            }
        }
    }, [selectedEventId]);

    // Selected zone
    const selectedZone = zones.find(z => z.id === selectedZoneId);

    // Add to history
    const addToHistory = useCallback((newZones: Zone[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newZones);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setIsSaved(false);
    }, [history, historyIndex]);

    // Undo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setZones(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    // Redo
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

    // Handle canvas click to add zone
    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (selectedTool === 'select') return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left) / (zoom / 100);
        const y = (e.clientY - rect.top) / (zoom / 100);

        const newZone: Zone = {
            id: generateId(),
            name: `New ${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}`,
            type: selectedTool as ZoneType,
            position: { x: x - 75, y: y - 40 },
            size: { width: 150, height: 80 },
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rows: selectedTool === 'seats' ? 4 : undefined,
            seatsPerRow: selectedTool === 'seats' ? 8 : undefined,
            price: selectedTool === 'stage' || selectedTool === 'barrier' ? undefined : 50,
        };

        const newZones = [...zones, newZone];
        setZones(newZones);
        addToHistory(newZones);
        setSelectedZoneId(newZone.id);
        setSelectedTool('select');
    };

    // Handle zone mouse down for drag
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

    // Handle resize handle mouse down
    const handleResizeMouseDown = (e: React.MouseEvent, zoneId: string, handle: string) => {
        e.stopPropagation();
        setSelectedZoneId(zoneId);
        setIsResizing(true);
        setResizeHandle(handle);
    };

    // Handle mouse move for drag/resize
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / (zoom / 100);
        const y = (e.clientY - rect.top) / (zoom / 100);

        if (isDragging && selectedZoneId) {
            setZones(zones.map(z =>
                z.id === selectedZoneId
                    ? { ...z, position: { x: x - dragOffset.x, y: y - dragOffset.y } }
                    : z
            ));
        }

        if (isResizing && selectedZoneId && resizeHandle) {
            setZones(zones.map(z => {
                if (z.id !== selectedZoneId) return z;

                let newWidth = z.size.width;
                let newHeight = z.size.height;
                let newX = z.position.x;
                let newY = z.position.y;

                if (resizeHandle.includes('e')) {
                    newWidth = Math.max(60, x - z.position.x);
                }
                if (resizeHandle.includes('w')) {
                    const deltaX = z.position.x - x;
                    newWidth = Math.max(60, z.size.width + deltaX);
                    newX = x;
                }
                if (resizeHandle.includes('s')) {
                    newHeight = Math.max(40, y - z.position.y);
                }
                if (resizeHandle.includes('n')) {
                    const deltaY = z.position.y - y;
                    newHeight = Math.max(40, z.size.height + deltaY);
                    newY = y;
                }

                return { ...z, position: { x: newX, y: newY }, size: { width: newWidth, height: newHeight } };
            }));
        }
    };

    // Handle mouse up
    const handleMouseUp = () => {
        if (isDragging || isResizing) {
            addToHistory([...zones]);
        }
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    };

    // Delete zone
    const deleteZone = (zoneId: string) => {
        const newZones = zones.filter(z => z.id !== zoneId);
        setZones(newZones);
        addToHistory(newZones);
        setSelectedZoneId(null);
    };

    // Update zone property
    const updateZone = (zoneId: string, updates: Partial<Zone>) => {
        const newZones = zones.map(z => z.id === zoneId ? { ...z, ...updates } : z);
        setZones(newZones);
        addToHistory(newZones);
    };

    // Duplicate zone
    const duplicateZone = (zoneId: string) => {
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        const newZone: Zone = {
            ...zone,
            id: generateId(),
            name: `${zone.name} (Copy)`,
            position: { x: zone.position.x + 20, y: zone.position.y + 20 },
        };

        const newZones = [...zones, newZone];
        setZones(newZones);
        addToHistory(newZones);
        setSelectedZoneId(newZone.id);
    };

    // Save layout
    const saveLayout = () => {
        if (!selectedEventId) {
            setSaveMessage({ type: 'error', text: 'Please select an event first' });
            setTimeout(() => setSaveMessage(null), 3000);
            return;
        }

        try {
            const event = eventsData.find(e => e.id === selectedEventId);
            saveEventLayout(selectedEventId, zones as LayoutZone[], event?.title);
            setIsSaved(true);
            setSaveMessage({ type: 'success', text: 'Layout saved successfully!' });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to save layout' });
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    // Generate seats for a zone
    const generateSeats = (zone: Zone): Seat[] => {
        if (zone.type !== 'seats' || !zone.rows || !zone.seatsPerRow) return [];

        const seats: Seat[] = [];
        for (let row = 0; row < zone.rows; row++) {
            for (let num = 0; num < zone.seatsPerRow; num++) {
                seats.push({
                    id: `${zone.id}-${row}-${num}`,
                    row: row + 1,
                    number: num + 1,
                    zoneId: zone.id,
                    status: Math.random() > 0.8 ? 'sold' : Math.random() > 0.9 ? 'reserved' : 'available',
                });
            }
        }
        return seats;
    };

    // Render zone on canvas
    const renderZone = (zone: Zone) => {
        const isSelected = selectedZoneId === zone.id;
        const seats = showSeatGrid && zone.type === 'seats' ? generateSeats(zone) : [];

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
                {/* Zone content */}
                <div
                    className={`w-full h-full rounded-xl border-2 transition-all flex flex-col items-center justify-center ${zone.type === 'stage' ? 'rounded-t-[50%]' : ''
                        } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f1219]' : ''}`}
                    style={{
                        borderColor: zone.color,
                        backgroundColor: `${zone.color}15`,
                        borderStyle: zone.type === 'barrier' ? 'dashed' : 'solid',
                    }}
                >
                    {/* Seat grid */}
                    {showSeatGrid && zone.type === 'seats' && seats.length > 0 ? (
                        <div
                            className="grid gap-0.5 p-2"
                            style={{
                                gridTemplateColumns: `repeat(${zone.seatsPerRow}, 1fr)`,
                            }}
                        >
                            {seats.map(seat => (
                                <div
                                    key={seat.id}
                                    className={`w-4 h-4 rounded-sm text-[6px] flex items-center justify-center font-bold transition-colors hover:scale-110 cursor-pointer ${seat.status === 'available' ? 'bg-emerald-500/80 hover:bg-emerald-400' :
                                        seat.status === 'reserved' ? 'bg-amber-500/80' :
                                            'bg-slate-600/80'
                                        }`}
                                    title={`Row ${seat.row}, Seat ${seat.number}`}
                                >
                                    {seat.number}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <span className="font-bold text-sm" style={{ color: zone.color }}>{zone.name}</span>
                            {zone.type === 'seats' && zone.rows && zone.seatsPerRow && (
                                <span className="text-[10px] text-slate-400 mt-1">
                                    {zone.rows * zone.seatsPerRow} seats
                                </span>
                            )}
                            {zone.type === 'standing' && (
                                <span className="text-[10px] text-slate-400 mt-1">Standing</span>
                            )}
                            {zone.price && (
                                <span className="text-[10px] font-bold mt-1" style={{ color: zone.color }}>
                                    ${zone.price}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* Resize handles */}
                {isSelected && selectedTool === 'select' && (
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
                                    cursor: handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize',
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, zone.id, handle)}
                            />
                        ))}
                        {['n', 'e', 's', 'w'].map(handle => (
                            <div
                                key={handle}
                                className="absolute bg-white rounded-full border-2 border-[#8655f6] z-30"
                                style={{
                                    width: handle === 'n' || handle === 's' ? 20 : 6,
                                    height: handle === 'e' || handle === 'w' ? 20 : 6,
                                    left: handle === 'w' ? -3 : handle === 'e' ? 'auto' : '50%',
                                    right: handle === 'e' ? -3 : 'auto',
                                    top: handle === 'n' ? -3 : handle === 's' ? 'auto' : '50%',
                                    bottom: handle === 's' ? -3 : 'auto',
                                    transform: handle === 'n' || handle === 's' ? 'translateX(-50%)' : 'translateY(-50%)',
                                    cursor: handle === 'n' || handle === 's' ? 'ns-resize' : 'ew-resize',
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, zone.id, handle)}
                            />
                        ))}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white flex">
            {/* Left Sidebar - Tools */}
            <aside className="w-72 hidden lg:flex flex-col p-5 bg-[#0f1219] border-r border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/admin/payouts')}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#8655f6] rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">grid_view</span>
                        </div>
                        <span className="font-bold">Layout Editor</span>
                    </div>
                </div>

                {/* Event Selector */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Select Event</h3>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:border-[#8655f6] focus:ring-1 focus:ring-[#8655f6]/30 transition-all"
                    >
                        <option value="">-- Select an event --</option>
                        {eventsData.map(event => (
                            <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                    </select>
                    {selectedEventId && (
                        <p className="text-xs text-slate-400 mt-2">
                            Editing layout for: <span className="text-[#8655f6] font-medium">{eventsData.find(e => e.id === selectedEventId)?.title}</span>
                        </p>
                    )}
                </div>

                {/* Tools */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Tools</h3>
                    <div className="space-y-1">
                        {TOOLS.map(tool => (
                            <button
                                key={tool.type}
                                onClick={() => setSelectedTool(tool.type)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedTool === tool.type
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

                {/* Zone Settings */}
                {selectedZone && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="border-t border-slate-800 pt-5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Zone Settings</h3>

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
                                                Total capacity: <span className="font-bold text-white">{(selectedZone.rows || 0) * (selectedZone.seatsPerRow || 0)} seats</span>
                                            </p>
                                        </div>
                                    </>
                                )}

                                {selectedZone.price !== undefined && (
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase mb-1.5 block">Price ($)</label>
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
                                                className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${selectedZone.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f1219]' : ''
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => duplicateZone(selectedZone.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                        Duplicate
                                    </button>
                                    <button
                                        onClick={() => deleteZone(selectedZone.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-rose-500/10 text-rose-400 rounded-lg text-sm hover:bg-rose-500/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedZone && (
                    <div className="flex-1 flex items-center justify-center text-center p-6">
                        <div>
                            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">touch_app</span>
                            <p className="text-sm text-slate-500">Select a zone to edit its properties</p>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Canvas Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-[#0f1219]/80 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">
                                {selectedEventId
                                    ? eventsData.find(e => e.id === selectedEventId)?.title
                                    : 'No event selected'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isSaved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                {isSaved ? 'Saved' : 'Unsaved'}
                            </span>
                        </div>
                        {/* Toast Message */}
                        {saveMessage && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium animate-pulse ${saveMessage.type === 'success'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                <span className="material-symbols-outlined text-sm">
                                    {saveMessage.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {saveMessage.text}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-slate-400">
                            <input
                                type="checkbox"
                                checked={showSeatGrid}
                                onChange={(e) => setShowSeatGrid(e.target.checked)}
                                className="rounded border-slate-600 bg-slate-800 text-[#8655f6]"
                            />
                            Show Seats
                        </label>
                        <button className="px-4 py-2 text-sm border border-slate-700 rounded-lg font-medium hover:bg-white/5">
                            Preview
                        </button>
                        <button
                            onClick={saveLayout}
                            className="px-4 py-2 text-sm bg-[#8655f6] rounded-lg font-bold flex items-center gap-2 hover:bg-[#7644e5] transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">save</span>
                            Save Layout
                        </button>
                    </div>
                </header>

                {/* Canvas */}
                <div
                    className="flex-1 p-6 bg-[#05060a] relative overflow-auto"
                    style={{ cursor: selectedTool !== 'select' ? 'crosshair' : 'default' }}
                >
                    {/* Grid Background */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                            backgroundSize: '20px 20px',
                        }}
                    />

                    {/* Canvas */}
                    <div
                        ref={canvasRef}
                        className="relative mx-auto bg-[#0f1219] rounded-2xl border border-slate-800 shadow-2xl"
                        style={{
                            width: 800 * (zoom / 100),
                            height: 500 * (zoom / 100),
                            transformOrigin: 'top left',
                        }}
                        onClick={handleCanvasClick}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Render zones */}
                        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
                            {zones.map(renderZone)}
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="fixed bottom-24 right-6 flex items-center gap-2 bg-slate-800/90 backdrop-blur-xl p-2 rounded-xl shadow-xl border border-slate-700">
                        <button
                            onClick={() => setZoom(Math.max(50, zoom - 10))}
                            className="p-2 hover:bg-white/10 rounded-lg"
                        >
                            <span className="material-symbols-outlined text-sm">zoom_out</span>
                        </button>
                        <span className="px-3 text-sm font-bold min-w-[50px] text-center">{zoom}%</span>
                        <button
                            onClick={() => setZoom(Math.min(150, zoom + 10))}
                            className="p-2 hover:bg-white/10 rounded-lg"
                        >
                            <span className="material-symbols-outlined text-sm">zoom_in</span>
                        </button>
                        <div className="w-px h-6 bg-slate-700 mx-1" />
                        <button
                            onClick={() => setZoom(100)}
                            className="p-2 hover:bg-white/10 rounded-lg text-sm font-medium"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="fixed bottom-24 left-6 text-xs text-slate-500 bg-slate-800/80 backdrop-blur px-3 py-2 rounded-lg">
                        <span className="material-symbols-outlined text-[10px] align-middle mr-1">lightbulb</span>
                        Click canvas to add • Drag to move • Resize handles • Del to remove • Ctrl+Z/Y undo/redo
                    </div>
                </div>
            </main>
        </div>
    );
};
