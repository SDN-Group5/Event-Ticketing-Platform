import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutAPI } from '../../services/layoutApiService';
import { EventLayout } from '../../types/layout';

export const EventDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const [event, setEvent] = useState<EventLayout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const layout = await LayoutAPI.getLayout(id);
                setEvent(layout);
            } catch (err) {
                console.error('Failed to fetch event details:', err);
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#151022] text-white flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8655f6]"></div>
            </div>
        );
    }

    if (!event || error) {
        return (
            <div className="min-h-screen bg-[#151022] text-white flex flex-col items-center justify-center p-6">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                <h1 className="text-3xl font-black mb-2">Event Not Found</h1>
                <p className="text-[#a59cba] mb-6">We couldn't find the event you're looking for.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const eventDate = new Date(event.eventDate || new Date());
    const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const handleBuyTicket = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate(`/event/${id}/zones`);
    };

    // Calculate max price from zones or default
    const maxPrice = event.zones
        ? Math.max(...event.zones.map(z => z.price || 0), event.minPrice || 0)
        : (event.minPrice || 0) * 2;

    return (
        <div className="min-h-screen bg-[#151022] text-white">
            <div className="w-full h-[450px] relative">
                <img
                    src={event.eventImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                    className="w-full h-full object-cover"
                    alt={event.eventName || 'Event'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-[#151022]/40 to-transparent" />
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-black/60 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                </button>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-[1280px] mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold mb-2">{event.eventName || 'Untitled Event'}</h1>
                    <p className="text-xl font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8655f6]">calendar_month</span> {dateStr} • {timeStr}
                    </p>
                </div>
            </div>

            <main className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-3 gap-4 border-y border-[#2d2839] py-6 mb-8">
                        <div className="flex gap-4 items-center">
                            <span className="p-3 rounded-full bg-[#2d2839] text-[#a59cba] material-symbols-outlined">calendar_today</span>
                            <div>
                                <p className="text-[#a59cba] text-sm">Date</p>
                                <p className="font-medium">{dateStr}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="p-3 rounded-full bg-[#2d2839] text-[#a59cba] material-symbols-outlined">schedule</span>
                            <div>
                                <p className="text-[#a59cba] text-sm">Time</p>
                                <p className="font-medium">{timeStr}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="p-3 rounded-full bg-[#2d2839] text-[#a59cba] material-symbols-outlined">location_on</span>
                            <div>
                                <p className="text-[#a59cba] text-sm">Venue</p>
                                <p className="font-medium">{event.eventLocation || 'TBD'}</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                    <p className="text-gray-300 leading-relaxed mb-8">
                        {event.eventDescription || 'No description available for this event.'}
                    </p>

                    <h2 className="text-2xl font-bold mb-4">Line-up</h2>
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {['Headliner Act', 'Special Guest', 'Opening Artist'].map((artist, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 shrink-0">
                                <div className="w-24 h-24 rounded-full border-2 border-[#8655f6] p-1">
                                    <img src={`https://picsum.photos/100?random=${i + 10}`} className="w-full h-full rounded-full object-cover" alt={artist} />
                                </div>
                                <p className="text-center font-medium">{artist}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="sticky top-24 bg-[#2d2839]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-6">Select Tickets</h3>
                        {[
                            { type: 'Standard Access', price: event.minPrice || 0, available: true },
                            { type: 'VIP Experience', price: maxPrice, available: true },
                        ].map((ticket, i) => (
                            <div key={ticket.type} className={`mb-4 p-4 rounded-xl border ${ticket.available ? 'border-[#2d2839] bg-[#1e1a29]/50 hover:border-[#8655f6]/50 cursor-pointer' : 'border-[#2d2839] bg-[#1e1a29]/30 opacity-50'} transition-all`}>
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold">{ticket.type}</span>
                                    <span className="font-bold">${ticket.price}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-xs flex items-center gap-1 ${ticket.available ? 'text-green-400' : 'text-red-400'}`}>
                                        <span className="material-symbols-outlined text-xs">{ticket.available ? 'check_circle' : 'cancel'}</span>
                                        {ticket.available ? 'Available' : 'Sold Out'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleBuyTicket}
                            className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-[#8655f6] to-[#a87ffb] text-white font-bold shadow-lg hover:shadow-[#8655f6]/40 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            Continue to Seat Selection
                        </button>
                        {!isAuthenticated && (
                            <p className="text-center text-xs text-gray-400 mt-3">
                                You'll need to sign in to complete your purchase
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
