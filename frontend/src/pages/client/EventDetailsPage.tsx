import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const EventDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const handleBuyTicket = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate(`/event/${id}/zones`);
    };

    return (
        <div className="min-h-screen bg-[#151022] text-white">
            <div className="w-full h-[450px] relative">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO6O6_GS5zOq5KquXUroZhSksr1uonwL0IwXRWAJzcNxazCWswLLUalYasfdLfHnrqqKL4cPQZGlxYekLWCtOxBzz7eHBXnlx911eRTrH8tu1oFksiohQWdw_lGYt3KCxbVlxQR5qcOGek59GwTIrfRrfk_DjGv1QOVnC_F6lR8sGlSAUDiXYCz-BS7O_5J-6wYVA_r0zMPehkF9DCCIa04pV3yIoXwwztd5nxTwC1dz_JtIMUEyFsi_7PRHOsWAJckw4Rg1Be2iZV"
                    className="w-full h-full object-cover"
                    alt="Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-[#151022]/40 to-transparent" />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-black/60 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                </button>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-[1280px] mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold mb-2">Neon Nights Festival 2024</h1>
                    <p className="text-xl font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8655f6]">calendar_month</span> Sep 24, 2024 • 8:00 PM
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
                                <p className="font-medium">Sat, Sep 24</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="p-3 rounded-full bg-[#2d2839] text-[#a59cba] material-symbols-outlined">schedule</span>
                            <div>
                                <p className="text-[#a59cba] text-sm">Time</p>
                                <p className="font-medium">8:00 PM</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="p-3 rounded-full bg-[#2d2839] text-[#a59cba] material-symbols-outlined">location_on</span>
                            <div>
                                <p className="text-[#a59cba] text-sm">Venue</p>
                                <p className="font-medium">Grand Arena</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                    <p className="text-gray-300 leading-relaxed mb-8">
                        Get ready for the most electrifying night of the year! Neon Nights Music Festival returns with a bigger lineup, louder bass, and an immersive light show that will transport you to another dimension.
                        Experience world-class DJs, stunning visual effects, and an atmosphere like no other. This is more than just a concert—it's a journey into the heart of electronic music.
                    </p>

                    <h2 className="text-2xl font-bold mb-4">Line-up</h2>
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {['DJ Thunder', 'Bass Queen', 'Neon Wave', 'Electric Soul'].map((artist, i) => (
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
                            { type: 'General Admission', price: 45, available: true },
                            { type: 'VIP Access', price: 120, available: true },
                            { type: 'Backstage Pass', price: 250, available: false },
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
                                    {ticket.available && (
                                        <button className="w-8 h-8 rounded bg-[#2d2839] hover:bg-[#8655f6] flex items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    )}
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
