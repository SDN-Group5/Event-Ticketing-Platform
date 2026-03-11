import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import { useAuth } from '../../contexts/AuthContext';

export const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [suggestedVenues, setSuggestedVenues] = useState<string[]>([]);
    const [loadingVenues, setLoadingVenues] = useState(true);
    const [venueAvailability, setVenueAvailability] = useState<any>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        dateStart: '',
        dateEnd: '',
        time: '',
        timeEnd: '',
        venue: '',
        description: '',
        category: 'music',
        banners: [] as { url: string; title: string }[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const steps = [
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Date & Venue' },
        { num: 3, label: 'Review' },
    ];

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            submitEvent();
        }
    };

    const submitEvent = async () => {
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

                // 2. Tạo MongoDB ObjectId giả định (24 hex chars)
                const generateObjectId = () => {
                    const timestamp = Math.floor(Date.now() / 1000).toString(16);
                    const randomVal = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => 
                        (Math.random() * 16 | 0).toString(16)
                    );
                    return (timestamp + randomVal).toLowerCase();
                };

                const realEventId = generateObjectId();

                // Generate layout with empty zones array
                await LayoutAPI.createLayout({
                    eventId: realEventId,
                    eventName: formData.name,
                    eventDate: startTimeString,
                    eventLocation: formData.venue,
                    eventDescription: formData.description,
                    zones: [],
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
                                <label className="block text-sm font-bold text-slate-300 mb-2">Event Name * <span className="text-xs text-slate-500">(min 5 characters)</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        setError(null);
                                    }}
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

                            {/* Banners Section */}
                            <div className="border-t border-slate-700 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-bold text-slate-300">Event Banners</label>
                                    <button
                                        onClick={addBanner}
                                        className="text-xs px-3 py-1.5 bg-[#8655f6]/20 border border-[#8655f6]/50 text-[#a78bfa] rounded-lg hover:bg-[#8655f6]/30 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Add Banner
                                    </button>
                                </div>
                                
                                {formData.banners.map((banner, idx) => (
                                    <div key={idx} className="bg-[#0f172a] rounded-lg border border-slate-700 p-4 mb-3">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="block text-xs text-slate-500 mb-1">Banner Image URL</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://example.com/banner.jpg"
                                                    value={banner.url}
                                                    onChange={(e) => updateBanner(idx, 'url', e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#8655f6]"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-slate-500 mb-1">Title (optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Banner title"
                                                    value={banner.title}
                                                    onChange={(e) => updateBanner(idx, 'title', e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#8655f6]"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeBanner(idx)}
                                                className="self-end px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        {banner.url && (
                                            <div className="mt-2 text-xs text-slate-500">
                                                <img src={banner.url} alt="preview" className="w-full h-24 object-cover rounded mt-1 opacity-60" onError={() => {}} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Date Start *</label>
                                    <input
                                        type="date"
                                        value={formData.dateStart}
                                        onChange={(e) => {
                                            setFormData({ ...formData, dateStart: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Time Start *</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => {
                                            setFormData({ ...formData, time: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Date End *</label>
                                    <input
                                        type="date"
                                        value={formData.dateEnd}
                                        onChange={(e) => {
                                            setFormData({ ...formData, dateEnd: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Time End *</label>
                                    <input
                                        type="time"
                                        value={formData.timeEnd}
                                        onChange={(e) => {
                                            setFormData({ ...formData, timeEnd: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                            </div>

                            {/* Venue Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Venue * {checkingAvailability && <span className="text-xs text-blue-400">(checking availability...)</span>}</label>
                                <input
                                    type="text"
                                    value={formData.venue}
                                    onChange={(e) => {
                                        setFormData({ ...formData, venue: e.target.value });
                                        setError(null);
                                    }}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6] placeholder-slate-600"
                                    placeholder="Enter venue name or address"
                                />
                            </div>

                            {/* Suggested Venues */}
                            <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700">
                                <p className="text-sm text-slate-400 mb-3">
                                    {loadingVenues ? '⏳ Loading suggested venues...' : '💡 Or select from popular venues:'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedVenues.map(venue => (
                                        <button
                                            key={venue}
                                            onClick={() => {
                                                setFormData({ ...formData, venue });
                                                setError(null);
                                            }}
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
                                    {formData.banners && formData.banners.length > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Promotional Banners</span>
                                            <span className="font-medium text-white">{formData.banners.length} image{formData.banners.length !== 1 ? 's' : ''}</span>
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

                            {/* Date & Venue Summary End */}

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
                            {step === 3 ? (
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
