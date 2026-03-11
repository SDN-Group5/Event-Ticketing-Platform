import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import { useAuth } from '../../contexts/AuthContext';

export const EditEventPage: React.FC = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const steps = [
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Date & Venue' },
        { num: 3, label: 'Description' },
        { num: 4, label: 'Review' },
    ];

    useEffect(() => {
        const loadEventData = async () => {
            try {
                if (!eventId) {
                    setError('Event ID is missing');
                    return;
                }

                const layout = await LayoutAPI.getLayout(eventId);

                // Parse dates
                const startDate = layout.eventDate ? new Date(layout.eventDate) : new Date();
                const endDate = layout.eventDate ? new Date(layout.eventDate) : new Date();

                setFormData({
                    name: layout.eventName || '',
                    dateStart: startDate.toISOString().split('T')[0],
                    dateEnd: endDate.toISOString().split('T')[0],
                    time: startDate.toTimeString().slice(0, 5),
                    timeEnd: endDate.toTimeString().slice(0, 5),
                    venue: layout.eventLocation || '',
                    description: layout.eventDescription || '',
                    category: 'music',
                });
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Failed to load event';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadEventData();
    }, [eventId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNext = async () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Submit
            setIsSubmitting(true);
            setError(null);
            try {
                if (!isAuthenticated) {
                    setError('You need to login to edit events');
                    navigate('/login');
                    return;
                }

                if (user?.role !== 'organizer' && user?.role !== 'admin') {
                    setError('You do not have permission to edit events');
                    navigate('/');
                    return;
                }

                const startTimeString = formData.dateStart && formData.time
                    ? new Date(`${formData.dateStart}T${formData.time}:00`).toISOString()
                    : new Date().toISOString();

                const endTimeString = formData.dateEnd && formData.timeEnd
                    ? new Date(`${formData.dateEnd}T${formData.timeEnd}:00`).toISOString()
                    : undefined;

                // Update layout info
                const layout = await LayoutAPI.getLayout(eventId!);
                await LayoutAPI.updateLayout(eventId!, {
                    ...layout,
                    eventName: formData.name,
                    eventDate: startTimeString,
                    eventLocation: formData.venue,
                    eventDescription: formData.description,
                });

                navigate('/organizer');
            } catch (err: any) {
                console.error("Failed to update event:", err);
                const errorMessage = err.response?.data?.error?.message
                    || err.response?.data?.message
                    || err.message
                    || "Failed to update event";
                setError(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1);
    };

    if (loading) {
        return (
            <div className="pb-20 pt-8">
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 pt-8">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Edit Event</h1>
                    <p className="text-gray-400">Update your event information</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Progress Steps */}
                <div className="mb-8 flex justify-between">
                    {steps.map(s => (
                        <div
                            key={s.num}
                            className={`flex-1 text-center py-3 mx-1 rounded-lg transition-all ${
                                step >= s.num
                                    ? 'bg-[#8655f6] text-white'
                                    : 'bg-[#2a2436] text-gray-400'
                            }`}
                        >
                            <div className="text-sm font-semibold">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="bg-[#2a2436] rounded-xl p-8 mb-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Event Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter event name"
                                    className="w-full px-4 py-3 bg-[#1a1625] border border-[#8655f6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8655f6]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-[#1a1625] border border-[#8655f6]/30 rounded-lg text-white focus:outline-none focus:border-[#8655f6]"
                                >
                                    <option value="music">Music</option>
                                    <option value="sports">Sports</option>
                                    <option value="conference">Conference</option>
                                    <option value="festival">Festival</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="dateStart"
                                        value={formData.dateStart}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#1a1625] border border-[#8655f6]/30 rounded-lg text-white focus:outline-none focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#1a1625] border border-[#8655f6]/30 rounded-lg text-white focus:outline-none focus:border-[#8655f6]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="dateEnd"
                                        value={formData.dateEnd}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#1a1625] border border-[#8655f6]/30 rounded-lg text-white focus:outline-none focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        name="timeEnd"
                                        value={formData.timeEnd}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#1a1625] border border-[#8655f6]/30 rounded-lg text-white focus:outline-none focus:border-[#8655f6]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Venue
                                </label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleInputChange}
                                    placeholder="Enter venue location"
                                    className="w-full px-4 py-3 bg-[#1a1625] border border-[#8655f6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8655f6]"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter event description"
                                    rows={8}
                                    className="w-full px-4 py-3 bg-[#1a1625] border border-[#8655f6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8655f6] resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white mb-4">Review Your Changes</h3>
                            <div className="space-y-3 text-gray-300">
                                <div className="flex justify-between items-start pb-3 border-b border-[#8655f6]/20">
                                    <span className="font-semibold text-white">Event Name:</span>
                                    <span>{formData.name}</span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b border-[#8655f6]/20">
                                    <span className="font-semibold text-white">Category:</span>
                                    <span>{formData.category}</span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b border-[#8655f6]/20">
                                    <span className="font-semibold text-white">Date:</span>
                                    <span>{formData.dateStart} to {formData.dateEnd}</span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b border-[#8655f6]/20">
                                    <span className="font-semibold text-white">Time:</span>
                                    <span>{formData.time} - {formData.timeEnd}</span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b border-[#8655f6]/20">
                                    <span className="font-semibold text-white">Venue:</span>
                                    <span>{formData.venue}</span>
                                </div>
                                <div className="flex justify-between items-start pt-3">
                                    <span className="font-semibold text-white">Description:</span>
                                    <span className="text-right">{formData.description.substring(0, 50)}...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={step === 1}
                        className="px-6 py-3 bg-[#2a2436] hover:bg-[#3a3446] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                        Previous
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-[#8655f6] hover:bg-[#7644e0] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                        {isSubmitting ? 'Saving...' : step === 4 ? 'Save Changes' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};
