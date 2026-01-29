import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/common/Card';
import eventsData from '../../data/events.json';

const getEventDateParts = (dateString: string) => {
    const date = new Date(dateString);
    return {
        date: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleString('default', { month: 'short' })
    };
};

export const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    // Simple state for demo filtering
    const [searchTerm, setSearchTerm] = useState(''); return (
        <div className="min-h-screen bg-[#0a0c10] text-white p-8">
            <div className="max-w-[1440px] mx-auto flex gap-8">
                {/* Filters Sidebar */}
                <aside className="w-72 flex-col gap-6 shrink-0 h-fit sticky top-8 hidden lg:flex">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <button className="text-[#ec4899] text-xs font-bold uppercase hover:underline">Reset All</button>
                    </div>
                    {/* Calendar Mock */}
                    <div className="border-b border-[#1e232b] pb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#a855f7]">calendar_month</span> Date Range
                        </h3>
                        <div className="bg-[#0f1218] rounded-xl p-3 border border-[#1e232b]">
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                {Array.from({ length: 14 }, (_, i) => i + 1).map(d => (
                                    <div
                                        key={d}
                                        className={`h-7 flex items-center justify-center rounded ${d === 5 || d === 10 ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white' : 'text-gray-400'}`}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Price Slider Mock */}
                    <div className="border-b border-[#1e232b] pb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#a855f7]">payments</span> Price Range
                        </h3>
                        <div className="relative h-1 bg-[#2a323d] rounded-full mt-6">
                            <div className="absolute left-1/4 right-1/4 h-full bg-gradient-to-r from-[#a855f7] to-[#ec4899]" />
                            <div className="absolute left-1/4 -top-1.5 w-4 h-4 bg-white rounded-full" />
                            <div className="absolute right-1/4 -top-1.5 w-4 h-4 bg-white rounded-full" />
                        </div>
                    </div>
                </aside>

                {/* Main Results */}
                <section className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black mb-1">
                                All <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#ec4899]">Events</span>
                            </h1>
                            <p className="text-gray-400 font-medium">
                                {eventsData.filter(e => e.status === 'published').length} events found
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {eventsData
                                .filter(event =>
                                    event.status === 'published' &&
                                    (searchTerm === '' || event.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                )
                                .map((item) => {
                                    const { date, month } = getEventDateParts(item.date);
                                    return (
                                        <EventCard
                                            key={item.id}
                                            title={item.title}
                                            imageUrl={item.image}
                                            date={date}
                                            month={month}
                                            price={`From $${item.minPrice}`}
                                            onBuyClick={() => navigate(`/event/${item.id}`)}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
