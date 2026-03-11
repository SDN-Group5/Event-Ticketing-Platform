import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import { EventAPI } from '../../services/eventApiService';
import { useAuth } from '../../contexts/AuthContext';

export const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        dateStart: '',
        dateEnd: '',
        time: '',
        timeEnd: '',
        venue: '',
        description: '',
        category: 'music',
    });
    const [ticketData, setTicketData] = useState({
        generalAdmission: { enabled: true, price: 45, quantity: 500 },
        vipAccess: { enabled: true, price: 120, quantity: 100 },
        backstagePass: { enabled: false, price: 250, quantity: 20 },
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const steps = [
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Date & Venue' },
        { num: 3, label: 'Tickets' },
        { num: 4, label: 'Review' },
    ];

    const handleNext = async () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Submit and redirect
            setIsSubmitting(true);
            setError(null);
            try {
                // Check quyền ngay trên UI cho rõ ràng (backend cũng sẽ check)
                if (!isAuthenticated) {
                    setError('Bạn cần đăng nhập để tạo sự kiện');
                    navigate('/login');
                    return;
                }
                if (user?.role !== 'organizer' && user?.role !== 'admin') {
                    setError('Tài khoản của bạn không có quyền Organizer/Admin để tạo sự kiện');
                    navigate('/');
                    return;
                }

                // 1. Gộp ngày và giờ thành chuẩn ISO String cho startTime
                const startTimeString = formData.dateStart && formData.time 
                    ? new Date(`${formData.dateStart}T${formData.time}:00`).toISOString()
                    : new Date().toISOString();

                const endTimeString = formData.dateEnd && formData.timeEnd
                    ? new Date(`${formData.dateEnd}T${formData.timeEnd}:00`).toISOString()
                    : undefined;

                // 2. Map dữ liệu form sang format của event-service
                const newEventPayload = {
                    title: formData.name,
                    description: formData.description,
                    category: formData.category,
                    location: formData.venue,
                    startTime: startTimeString,
                    endTime: endTimeString,
                };

                // 3. Gọi API tạo Event
                const eventResponse = await EventAPI.createEvent(newEventPayload);
                
                // Lấy ID thật sự vừa được tạo từ MongoDB
                const realEventId = eventResponse.data._id;

                // 4. Create layout with ticket types
                // Helper to generate UUID
                const generateUUID = () => {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        const r = Math.random() * 16 | 0;
                        const v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                };

                // Helper to calculate rows and seatsPerRow from quantity
                const calculateSeatsLayout = (quantity: number) => {
                    // Try to create a square-ish layout
                    const rows = Math.ceil(Math.sqrt(quantity));
                    const seatsPerRow = Math.ceil(quantity / rows);
                    return { rows, seatsPerRow };
                };

                // Helper to generate zone position (fan layout)
                const getZonePosition = (index: number, totalZones: number) => {
                    const canvasWidth = 800;
                    const canvasHeight = 600;
                    const zoneWidth = 120;
                    const zoneHeight = 100;
                    
                    if (totalZones === 1) {
                        return { x: (canvasWidth - zoneWidth) / 2, y: (canvasHeight - zoneHeight) / 2 };
                    } else if (totalZones === 2) {
                        return {
                            x: index === 0 ? 100 : 580,
                            y: (canvasHeight - zoneHeight) / 2
                        };
                    } else {
                        // 3 zones: top-left, top-right, bottom-center
                        if (index === 0) return { x: 80, y: 80 };
                        if (index === 1) return { x: 600, y: 80 };
                        return { x: (canvasWidth - zoneWidth) / 2, y: 400 };
                    }
                };

                const ticketZones = [];
                let zoneIndex = 0;

                if (ticketData.generalAdmission.enabled) {
                    const { rows, seatsPerRow } = calculateSeatsLayout(ticketData.generalAdmission.quantity);
                    const position = getZonePosition(zoneIndex, 
                        [ticketData.generalAdmission.enabled, ticketData.vipAccess.enabled, ticketData.backstagePass.enabled].filter(Boolean).length
                    );
                    ticketZones.push({
                        id: generateUUID(),
                        name: 'General Admission',
                        type: 'seats',
                        position: { x: position.x, y: position.y },
                        size: { width: 120, height: 100 },
                        color: '#3b82f6',
                        rows,
                        seatsPerRow,
                        price: ticketData.generalAdmission.price,
                        rotation: 0
                    });
                    zoneIndex++;
                }

                if (ticketData.vipAccess.enabled) {
                    const { rows, seatsPerRow } = calculateSeatsLayout(ticketData.vipAccess.quantity);
                    const position = getZonePosition(zoneIndex,
                        [ticketData.generalAdmission.enabled, ticketData.vipAccess.enabled, ticketData.backstagePass.enabled].filter(Boolean).length
                    );
                    ticketZones.push({
                        id: generateUUID(),
                        name: 'VIP Access',
                        type: 'seats',
                        position: { x: position.x, y: position.y },
                        size: { width: 120, height: 100 },
                        color: '#8655f6',
                        rows,
                        seatsPerRow,
                        price: ticketData.vipAccess.price,
                        rotation: 0
                    });
                    zoneIndex++;
                }

                if (ticketData.backstagePass.enabled) {
                    const { rows, seatsPerRow } = calculateSeatsLayout(ticketData.backstagePass.quantity);
                    const position = getZonePosition(zoneIndex,
                        [ticketData.generalAdmission.enabled, ticketData.vipAccess.enabled, ticketData.backstagePass.enabled].filter(Boolean).length
                    );
                    ticketZones.push({
                        id: generateUUID(),
                        name: 'Backstage Pass',
                        type: 'seats',
                        position: { x: position.x, y: position.y },
                        size: { width: 120, height: 100 },
                        color: '#ec4899',
                        rows,
                        seatsPerRow,
                        price: ticketData.backstagePass.price,
                        rotation: 0
                    });
                    zoneIndex++;
                }

                // We don't need to create zones during event creation, pass empty array
                await LayoutAPI.createLayout({
                    eventId: realEventId,
                    eventName: formData.name,
                    eventDate: startTimeString,
                    eventLocation: formData.venue,
                    eventDescription: formData.description,
                    zones: ticketZones,
                    canvasWidth: 800,
                    canvasHeight: 600,
                    canvasColor: '#0f1219'
                });

                navigate('/organizer/events');
            } catch (err: any) {
                console.error("Failed to create event:", err);
                const errorMessage = err.response?.data?.error?.message 
                                  || err.response?.data?.message 
                                  || err.message 
                                  || "Failed to create event";
                setError(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate('/organizer');
    };

    return (
        <div>
            <div className="max-w-4xl mx-auto pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/organizer')}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white">Create New Event</h1>
                        <p className="text-slate-400">Fill in the details to create your event</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-10">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex items-center gap-3 ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step > s.num ? 'bg-emerald-500' :
                                    step === s.num ? 'bg-gradient-to-r from-[#8655f6] to-[#d946ef]' :
                                        'bg-slate-700'
                                    }`}>
                                    {step > s.num ? (
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    ) : s.num}
                                </div>
                                <span className="text-sm font-medium hidden md:block">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-12 md:w-24 h-1 mx-2 md:mx-4 rounded ${step > s.num ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-[#1e293b]/60 backdrop-blur border border-white/5 rounded-2xl p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Event Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6] focus:ring-2 focus:ring-[#8655f6]/20"
                                    placeholder="Enter event name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                >
                                    <option value="music">Music & Concerts</option>
                                    <option value="sports">Sports</option>
                                    <option value="arts">Arts & Theater</option>
                                    <option value="food">Food & Drink</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6] min-h-[120px]"
                                    placeholder="Describe your event..."
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Date Start</label>
                                    <input
                                        type="date"
                                        value={formData.dateStart}
                                        onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Time Start</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Date End</label>
                                    <input
                                        type="date"
                                        value={formData.dateEnd}
                                        onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Time End</label>
                                    <input
                                        type="time"
                                        value={formData.timeEnd}
                                        onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Venue *</label>
                                <input
                                    type="text"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    placeholder="Enter venue name or address"
                                />
                            </div>
                            <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700">
                                <p className="text-sm text-slate-400 mb-3">Or select from popular venues:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Grand Arena', 'City Hall', 'Riverside Park', 'Convention Center'].map(venue => (
                                        <button
                                            key={venue}
                                            onClick={() => setFormData({ ...formData, venue })}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.venue === venue
                                                ? 'bg-[#8655f6] text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                        >
                                            {venue}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Ticket Types</h3>
                            {[
                                { key: 'generalAdmission', label: 'General Admission', color: '#3b82f6' },
                                { key: 'vipAccess' as const, label: 'VIP Access', color: '#8655f6' },
                                { key: 'backstagePass' as const, label: 'Backstage Pass', color: '#ec4899' }
                            ].map((type) => (
                                <div key={type.key} className="bg-[#0f172a] border border-slate-700 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: type.color }}></div>
                                            <span className="font-bold text-white">{type.label}</span>
                                        </div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={ticketData[type.key as keyof typeof ticketData].enabled}
                                                onChange={(e) => setTicketData({
                                                    ...ticketData,
                                                    [type.key]: { ...ticketData[type.key as keyof typeof ticketData], enabled: e.target.checked }
                                                })}
                                                className="rounded border-slate-600"
                                            />
                                            <span className="text-sm text-slate-400">Enable</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Price ($)</label>
                                            <input
                                                type="number"
                                                value={ticketData[type.key as keyof typeof ticketData].price}
                                                onChange={(e) => setTicketData({
                                                    ...ticketData,
                                                    [type.key]: { ...ticketData[type.key as keyof typeof ticketData], price: parseFloat(e.target.value) }
                                                })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#8655f6]"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                value={ticketData[type.key as keyof typeof ticketData].quantity}
                                                onChange={(e) => setTicketData({
                                                    ...ticketData,
                                                    [type.key]: { ...ticketData[type.key as keyof typeof ticketData], quantity: parseInt(e.target.value) }
                                                })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#8655f6]"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {Object.values(ticketData).every(t => !t.enabled) && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-yellow-400">warning</span>
                                    <p className="text-sm text-yellow-400">At least one ticket type must be enabled</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Review Your Event</h3>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-red-400">error</span>
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Basic Info Summary */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Basic Information</h4>
                                <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Event Name</span>
                                        <span className="font-bold text-white">{formData.name || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Category</span>
                                        <span className="font-medium text-white capitalize">{formData.category}</span>
                                    </div>
                                    {formData.description && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Description</span>
                                            <span className="font-medium text-white">{formData.description.substring(0, 40) + (formData.description.length > 40 ? '...' : '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date & Venue Summary */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Date & Venue</h4>
                                <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Start</span>
                                        <span className="font-medium text-white">{formData.dateStart || 'Not set'} at {formData.time || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">End</span>
                                        <span className="font-medium text-white">{formData.dateEnd || 'Not set'} at {formData.timeEnd || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Venue</span>
                                        <span className="font-medium text-white">{formData.venue || 'Not set'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Types Summary */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Ticket Configuration</h4>
                                <div className="space-y-2">
                                    {[
                                        { key: 'generalAdmission' as const, label: 'General Admission' },
                                        { key: 'vipAccess' as const, label: 'VIP Access' },
                                        { key: 'backstagePass' as const, label: 'Backstage Pass' }
                                    ].map((t) => (
                                        ticketData[t.key].enabled && (
                                            <div key={t.key} className="flex justify-between text-sm bg-slate-800/50 p-3 rounded-lg">
                                                <span className="font-medium text-white">{t.label}</span>
                                                <div className="flex gap-4">
                                                    <span className="text-blue-400">${ticketData[t.key].price}</span>
                                                    <span className="text-slate-400">{ticketData[t.key].quantity} available</span>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>

                            {!error && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                                    <p className="text-sm text-emerald-400">Your event is ready to be published!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
                        <button
                            onClick={handleBack}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-slate-600 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-xl font-bold text-white shadow-lg shadow-[#8655f6]/30 hover:shadow-[#8655f6]/50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {step === 4 ? (
                                <>
                                    {isSubmitting ? (
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined">publish</span>
                                    )}
                                    {isSubmitting ? 'Publishing...' : 'Publish Event'}
                                </>
                            ) : (
                                <>
                                    Continue
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
