import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/common/Card';
import { LayoutAPI } from '../../services/layoutApiService';
import { EventLayout } from '../../types/layout';

const getEventDateParts = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return {
            date: date.getDate().toString().padStart(2, '0'),
            month: date.toLocaleString('default', { month: 'short' })
        };
    } catch (e) {
        return { date: '01', month: 'JAN' };
    }
};

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventLayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const layouts = await LayoutAPI.getAllLayouts();
                setEvents(layouts);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('Failed to load events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/search');
    };

    return (
        <>
            {/* Hero */}
            <div className="relative w-full min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-[#151022]/80 to-transparent z-10" />
                    <img
                        alt="Concert"
                        className="w-full h-full object-cover opacity-80"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT7K98ACs9vSfWQJt6l98gKBFXGVc38ShpjT8RCOhtRLtf6Ln3C9-S-dqANQv7H0a4rbWE1B9NP8y1e109gSd0Zj_-MkAHP6hPYeoklUrPg6VTM-f_KsMk_CLC6nO7gJ4Crv28pUo9DVBTVA5pK0lR34RTkxamij83oLj22VJKOdD0dCkS2oKWxtBEJONPQ1Z6cJD5TKpb4BYwGwcgPnKglqMo5W_z-2Sd7VzM0wGBqJM0mKQ-knGZaMM0KFyud3hDkWe-FGeHw4Ft"
                    />
                </div>
                <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-4 pt-10 pb-20">
                    <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-[#8655f6] mb-6 shadow-[0_0_20px_rgba(137,90,246,0.3)]">
                        <span className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse" />
                        Live Now
                    </span>
                    <h1 className="text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6 drop-shadow-2xl">
                        Experience the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#8655f6] to-[#d946ef]">Music Live</span>
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl font-normal max-w-2xl mb-10 leading-relaxed">
                        Secure your spot at the hottest events this season. From underground raves to stadium tours, feel the beat of the city.
                    </p>
                    <button
                        onClick={() => navigate('/search')}
                        className="h-14 px-8 rounded-xl bg-[#8655f6] text-white text-base font-bold shadow-[0_0_40px_rgba(137,90,246,0.6)] hover:bg-[#7f0df2] transition-all transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        <span>Explore Events</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="relative z-30 px-4 -mt-16 md:-mt-20 mb-12">
                <div className="max-w-[1100px] mx-auto glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                                <span className="material-symbols-outlined">event_note</span>
                            </div>
                            <input
                                className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#8655f6]/50 placeholder:text-gray-500"
                                placeholder="Event or Artist"
                                type="text"
                            />
                        </div>
                        <div className="md:col-span-3 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <select className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-10 focus:ring-2 focus:ring-[#8655f6]/50 appearance-none">
                                <option>All Cities</option>
                                <option>New York</option>
                                <option>Los Angeles</option>
                                <option>Miami</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                                <span className="material-symbols-outlined">calendar_month</span>
                            </div>
                            <input
                                className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#8655f6]/50"
                                type="date"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-[#8655f6] to-[#7c3aed] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-[#8655f6]/40 transition-all"
                            >
                                <span className="material-symbols-outlined">search</span>
                                <span>Search</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="w-full px-4 md:px-10 pb-20 max-w-[1440px] mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8">Trending Now</h2>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8655f6]"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 py-10 bg-white/5 rounded-xl border border-red-500/20">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 bg-white/5 rounded-xl border border-white/10">
                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-500">event_busy</span>
                        <p>No events found at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {events.map((item) => {
                            const { date, month } = getEventDateParts(item.eventDate || new Date().toISOString());
                            return (
                                <EventCard
                                    key={item.eventId}
                                    title={item.eventName || 'Untitled Event'}
                                    imageUrl={item.eventImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                                    date={date}
                                    month={month}
                                    price={`From $${item.minPrice || 0}`}
                                    onBuyClick={() => navigate(`/event/${item.eventId}`)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};
