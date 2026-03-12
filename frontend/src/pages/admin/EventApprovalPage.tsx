import { useNavigate } from 'react-router-dom';
import { EventApprovalAPI } from '../../services/eventApprovalApiService';
import { ROUTES } from '../../constants/routes';
import React, { useState, useEffect } from 'react';
interface PendingEvent {
    _id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    organizerId: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    bannerUrl?: string;
}

export const EventApprovalPage: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<PendingEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [rejectingEventId, setRejectingEventId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [search, setSearch] = useState('');
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

    const fetchPendingEvents = async (pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await EventApprovalAPI.getPendingEvents({
                page: pageNum,
                limit: 10,
                search: search || undefined
            });

            setEvents(response.data || []);
            setTotal(response.pagination?.total || 0);
            setPage(pageNum);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch pending events';
            setError(errorMessage);
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvents(1);
    }, [search]);

    const handleApprove = async (eventId: string) => {
        if (!window.confirm('Are you sure you want to approve this event?')) {
            return;
        }

        try {
            setError(null);
            await EventApprovalAPI.approveEvent(eventId);
            setSuccess('Event approved and published successfully');
            fetchPendingEvents(page);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to approve event';
            setError(errorMessage);
        }
    };

    const handleReject = async (eventId: string) => {
        if (!rejectionReason.trim()) {
            setError('Please provide a rejection reason');
            return;
        }

        if (!window.confirm('Are you sure you want to reject this event?')) {
            return;
        }

        try {
            setError(null);
            await EventApprovalAPI.rejectEvent(eventId, rejectionReason);
            setSuccess('Event rejected successfully');
            setRejectingEventId(null);
            setRejectionReason('');
            fetchPendingEvents(page);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to reject event';
            setError(errorMessage);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && events.length === 0) {
        return (
            <div className="pb-20 pt-8">
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
                </div>
            </div>
        );
    }

    const totalPages = Math.ceil(total / 10);

    return (
        <div className="pb-20 pt-8">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Event Approval Center</h1>
                    <p className="text-gray-400">
                        Review and approve draft events from organizers
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500 text-green-400 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search events by title or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 bg-[#2a2436] border border-[#8655f6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8655f6]"
                    />
                </div>

                {/* Statistics */}
                <div className="mb-8 bg-[#2a2436] rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Events Awaiting Review (Drafts)</p>
                            <p className="text-4xl font-bold text-white mt-2">{total}</p>
                        </div>
                        <span className="material-symbols-outlined text-6xl text-[#8655f6]">event_note</span>
                    </div>
                </div>

                {/* Events List */}
                {events.length === 0 ? (
                    <div className="text-center py-16 bg-[#2a2436] rounded-xl">
                        <span className="material-symbols-outlined text-6xl text-gray-600 mb-4 flex justify-center">
                            verified_user
                        </span>
                        <h2 className="text-xl font-semibold text-gray-400 mb-2">No pending events</h2>
                        <p className="text-gray-500">All events have been reviewed!</p>
                    </div>
                ) : (
                    <div className="space-y-4 mb-8">
                        {events.map(event => (
                            <div key={event._id} className="bg-[#2a2436] rounded-xl overflow-hidden">
                                <div
                                    onClick={() => setExpandedEventId(
                                        expandedEventId === event._id ? null : event._id
                                    )}
                                    className="p-6 cursor-pointer hover:bg-[#3a3446] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Banner thumbnail */}
                                        {event.bannerUrl && (
                                            <div className="hidden md:block w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-[#3a3446] bg-[#15101f]">
                                                <img
                                                    src={event.bannerUrl}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {event.title}
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-1">Category</p>
                                                    <p className="text-white font-semibold capitalize">
                                                        {event.category}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-1">Location</p>
                                                    <p className="text-white font-semibold">{event.location}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-1">Start Date</p>
                                                    <p className="text-white font-semibold">
                                                        {formatDate(event.startTime)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-1">Submitted</p>
                                                    <p className="text-white font-semibold">
                                                        {formatDate(event.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Description Preview */}
                                            <div className="text-gray-300 text-sm line-clamp-2">
                                                {event.description || 'No description provided'}
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0">
                                            <span className="material-symbols-outlined text-2xl text-gray-500">
                                                {expandedEventId === event._id ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedEventId === event._id && (
                                    <div className="border-t border-[#3a3446] p-6 bg-[#1f1a27]">
                                        {/* Large banner preview */}
                                        {event.bannerUrl && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                                                    Event Banner
                                                </h4>
                                                <div className="rounded-xl overflow-hidden border border-[#3a3446] bg-[#15101f]">
                                                    <img
                                                        src={event.bannerUrl}
                                                        alt={event.title}
                                                        className="w-full max-h-64 object-cover"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Full Description */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-gray-400 mb-2">
                                                Full Description
                                            </h4>
                                            <p className="text-gray-300 whitespace-pre-wrap">
                                                {event.description || 'No description provided'}
                                            </p>
                                        </div>

                                        {/* Rejection Reason Form */}
                                        {rejectingEventId === event._id && (
                                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                <label className="block text-sm font-semibold text-white mb-2">
                                                    Why are you rejecting this event?
                                                </label>
                                                <textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="Please provide a detailed reason so the organizer can improve..."
                                                    className="w-full px-3 py-2 bg-[#2a2436] border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                                                    rows={4}
                                                />
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            {rejectingEventId === event._id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleReject(event._id)}
                                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                                    >
                                                        Confirm Rejection
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setRejectingEventId(null);
                                                            setRejectionReason('');
                                                        }}
                                                        className="flex-1 px-4 py-2 bg-[#2a2436] hover:bg-[#3a3446] text-white rounded-lg font-medium transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(event._id)}
                                                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">
                                                            check_circle
                                                        </span>
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`${ROUTES.LAYOUT_EDITOR}?eventId=${event._id}`)}
                                                        className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">
                                                            visibility
                                                        </span>
                                                        Review Layout
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingEventId(event._id)}
                                                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">
                                                            cancel
                                                        </span>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => fetchPendingEvents(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 bg-[#2a2436] hover:bg-[#3a3446] disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-white">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => fetchPendingEvents(page + 1)}
                            disabled={page >= totalPages}
                            className="px-4 py-2 bg-[#2a2436] hover:bg-[#3a3446] disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
