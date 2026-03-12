import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { useToast } from '../../components/common/ToastProvider';

interface EventDetail {
    _id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
}

interface EventStats {
    totalCapacity: number;
    ticketsSold: number;
    revenue: number;
}

export const EventDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();
    const { showToast } = useToast();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [stats, setStats] = useState<EventStats>({
        totalCapacity: 0,
        ticketsSold: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadEventData = async () => {
            try {
                if (!eventId) {
                    setError('Event ID is missing');
                    return;
                }

                // Load layout and map to event
                try {
                    const layout = await LayoutAPI.getLayout(eventId);
                    setEvent({
                        _id: layout.eventId || eventId,
                        title: layout.eventName || 'Unnamed Event',
                        description: layout.eventDescription || '',
                        category: 'Event',
                        location: layout.eventLocation || 'TBD',
                        startTime: layout.eventDate || new Date().toISOString(),
                        endTime: layout.eventDate || new Date().toISOString(),
                        createdAt: (layout as any).createdAt || new Date().toISOString(),
                        updatedAt: (layout as any).updatedAt || new Date().toISOString(),
                    });
                    if (layout && layout.zones) {
                        let totalCapacity = 0;
                        let ticketsSold = 0;
                        let revenue = 0;

                        layout.zones.forEach((zone: any) => {
                            if (zone.type === 'seats') {
                                const meta = zone.seatMetadata;
                                totalCapacity += meta?.totalSeats ?? 0;
                                ticketsSold += meta?.soldSeats ?? 0;
                                revenue += (meta?.soldSeats ?? 0) * (zone.price ?? 0);
                            } else if (zone.type === 'standing') {
                                // For standing areas, calculate capacity from rows × seatsPerRow
                                const capacity = (zone.rows ?? 0) * (zone.seatsPerRow ?? 0);
                                totalCapacity += capacity;
                            }
                        });

                        setStats({ totalCapacity, ticketsSold, revenue });
                    }
                } catch (err) {
                    console.error('Error loading layout stats:', err);
                }
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Failed to load event';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadEventData();
    }, [eventId]);

    const handleEdit = () => {
        navigate(`/organizer/events/${eventId}/edit`);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Delete layout
            try {
                await LayoutAPI.deleteLayout(eventId!);
            } catch (err) {
                console.error('Error deleting layout:', err);
            }
            showToast('Event deleted successfully', 'success');
            navigate('/organizer/events');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete event';
            showToast(errorMessage, 'error');
            setError(errorMessage);
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    const getEventStatus = (startTime: string) => {
        const now = new Date().getTime();
        const eventTime = new Date(startTime).getTime();
        return eventTime > now ? 'Upcoming' : 'Completed';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    if (!event) {
        return (
            <div className="pb-20 pt-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center py-16">
                        <h2 className="text-xl font-semibold text-gray-400 mb-2">Event not found</h2>
                        <button
                            onClick={() => navigate('/organizer')}
                            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
                        >
                            Back to Events
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 pt-8">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                getEventStatus(event.startTime) === 'Upcoming'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-purple-500/20 text-purple-400'
                            }`}>
                                {getEventStatus(event.startTime)}
                            </span>
                        </div>
                        <p className="text-gray-400">Event ID: {event._id}</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={handleEdit}
                            className="flex-1 md:flex-none px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">edit</span>
                            Edit
                        </button>
                        <button
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            className="flex-1 md:flex-none px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">delete</span>
                            Delete
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Statistics Cards */}
                    <div className="bg-[#2a2436] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-[#8655f6] text-2xl">event_seat</span>
                            <span className="text-gray-400 text-sm">Seat Capacity</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalCapacity}</p>
                    </div>

                    <div className="bg-[#2a2436] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-green-400 text-2xl">local_activity</span>
                            <span className="text-gray-400 text-sm">Tickets Sold</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.ticketsSold}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {stats.totalCapacity > 0 
                                ? `${Math.round((stats.ticketsSold / stats.totalCapacity) * 100)}% capacity`
                                : 'No seats'}
                        </p>
                    </div>

                    <div className="bg-[#2a2436] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-yellow-400 text-2xl">attach_money</span>
                            <span className="text-gray-400 text-sm">Revenue</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            ${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-[#2a2436] rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">info</span>
                                Event Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Category</p>
                                    <p className="text-white font-medium capitalize">{event.category}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Location</p>
                                    <p className="text-white font-medium">{event.location}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Start Time</p>
                                    <p className="text-white font-medium">{formatDate(event.startTime)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">End Time</p>
                                    <p className="text-white font-medium">{formatDate(event.endTime)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Meta Information */}
                        <div className="bg-[#2a2436] rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">schedule</span>
                                Created & Updated
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Created At</p>
                                    <p className="text-white">{formatDate(event.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Updated At</p>
                                    <p className="text-white">{formatDate(event.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="bg-[#2a2436] rounded-xl p-6 h-fit">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">description</span>
                            Description
                        </h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {event.description || 'No description provided'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate(`/organizer/events/${eventId}/tickets`)}
                        className="px-6 py-3 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">local_activity</span>
                        Manage Tickets
                    </button>
                    <button
                        onClick={() => navigate(`/organizer/events/${eventId}/layout`)}
                        className="px-6 py-3 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">layers</span>
                        Manage Layout
                    </button>
                    <button
                        onClick={() => navigate('/organizer/events')}
                        className="px-6 py-3 bg-[#2a2436] hover:bg-[#3a3446] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                title="Delete Event"
                message="Are you sure you want to delete this event? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDangerous={true}
                isLoading={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteConfirmOpen(false)}
            />
        </div>
    );
};
