import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/common/Card';

const featuredEvents = [
    { id: '1', title: "Midnight Bass Festival", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDi6Oy71QOrOhpI-eEIZzHCZiMS_yadvN2UnsBAJsc0c9onFTs33e__ir4YWKaYR6eM-SDx4P9LmTzvTfsjNZ9DeRiTs97ZsBA6xSbHFhbu__IpgbqKDQ5AoKI6LL13YZQO-uKaKWYpRDe1Z2yfGY4HZU3DTsc68i27BNEhYnNebUw1ty7S9Qx6n1LG7aO2ruJdhaWzl8zC0KLUYm2ILm8ZxUWXNhcq72VRo79cKc3NBeZSrp43nmH9skeO7byVQjk2AtdTux1kRS8y", date: "24", month: "Oct" },
    { id: '2', title: "Neon Nights Tour", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh2nqKN4dfkx_cnZP0iEoY6bSjZJ2uWrgMWMWS5wh7Z9fTX6PgHxZ7ky5mQfWkEdEf0qDNz9UCg4T7FksyVeOsLxyiFiMmDLFdMnaEpnfhOJF2l0dwITFrO7s4pabD4_nJ0rV9j3ACNr_0BY65jkg7nkXJaT5JPZq1nPyXaahJ0kdvQXQvsdG9RzjP-_nXJsfSFXouAfy45ZUVDd4TrMzlqVYGdR5nhExRtrP2CilHZc_zB_j_JBySSP5jZLzAsdGntY9ORv_A_ji8", date: "02", month: "Nov" },
    { id: '3', title: "Acoustic Sunday", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFKPgI3neKtoFLBwPHGnnXGqo02lVoYR8smPkzZuw0v4uA8i-ElOrDFw3nBgytl9QfPLf4Pstk9Xr87Q1H1zO8zJAkmSvi65XrvvQ3_J2K6hxLWyihYprE53gPYkq4-nBrlOlpcdRj6YHFO4kVOCAMtR8XmWbVTzOofALc4ublWwNmICgw-dPzj8QaR9_KNLQmmZtmwRgA6lfF6rje9LCkNVsW8WtobqNNm3J1NQVmWBxqrj0gEaUujGxQRVcZyweFCpNZ0x-LZvHW", date: "15", month: "Nov" },
    { id: '4', title: "Rock Symphony", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNvJZmi9V4NuAXXmRFmR0AQBPcNn93Q0QeSAH3yrkfuos3hgrksYSMjDa7mZAWddPAMZxnJfFeaskiVRgn84KM10C65miITV1ibQkM0oOkkPix9aXLuqYx675Lzu2us2zqH1vX3Z5sBTWQOnfqsmS3Rn0QRJ9p5ZxQuOlyaqzcfXB6mm0eOF5CCg93H8m7vVHwA69_vZFchTwmfpwF3K_n4YD4S-Pj2Uhzj5_ueN6yB8YrbPeS3ObDyQ0cuHbzHlOrq74TJhWOQFGF", date: "05", month: "Dec" },
];

export const HomePage: React.FC = () => {
    const navigate = useNavigate();

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredEvents.map((item) => (
                        <EventCard
                            key={item.id}
                            title={item.title}
                            imageUrl={item.img}
                            date={item.date}
                            month={item.month}
                            onBuyClick={() => navigate(`/event/${item.id}`)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};
