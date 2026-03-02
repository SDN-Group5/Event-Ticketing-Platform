import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const MENU_ITEMS = [
  { label: 'Vé của tôi', path: ROUTES.MY_TICKETS },
  { label: 'Lịch sử giao dịch', path: ROUTES.TRANSACTION_HISTORY },
  { label: 'Yêu thích', path: ROUTES.WISHLIST },
  { label: 'Cài đặt hồ sơ', path: ROUTES.PROFILE },
];

export const ProfilePage: React.FC = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex">
            {/* Side Nav */}
            <aside className="w-64 p-6 flex flex-col gap-8 border-r border-white/5 hidden lg:flex">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-700 bg-cover bg-center" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAzQLjgCEZYT3Z1IquCHXVgRti4HN_IpR_ZI0626Xzmeo3jOq-mu0Nuow6DAApb6_rdyvuJhEq2q4hznXrT-Tgc1j5VnI-51JhxVBWR7FEwUD2q9WALOhWYKjo9JrV0tgBCH6Zq71AptCBLtxXhXyAGE9j3a-oW2efRycH7sNIKmq7UxRZhJwGo84k07maxd5CQyvHkEqQ0H_VlIdBqwF37eOg2TYpFsykyVyw28QBrHxtqkqLy4UJob9hPCFGjat0mGBGT_keoitGd)' }} />
                    <div>
                        <h2 className="font-bold">Alex Rivers</h2>
                        <span className="text-xs text-[#8655f6] font-bold uppercase">Elite Attendee</span>
                    </div>
                </div>
                <nav className="flex flex-col gap-2">
                    {MENU_ITEMS.map(({ label, path }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === path ? 'bg-[#8655f6] text-white shadow-lg shadow-[#8655f6]/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                {/* Profile Header */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div
                            className="w-20 h-20 rounded-full border-4 border-[#8655f6]/30 bg-gray-700 bg-cover bg-center"
                            style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuADu6W6U_wGI3hym-PUPGAnLt7ZADKR5c8VG8hffkvrKXc82rcFJNoeMq-2xzzeurC8HL7sVa6TA1Ro5bnVjAgVgtNWVwS343oJOCBHE9bttCOAArQoSS3-rpX99NvIxX5npXx64EdN1npCxvBrShPfiPaufbrsNEHjtJ3eprgPJblM5ZvnWlI-0-0WRiWFtz7OnNCvBLW0by-5ufXLkll41aUhHyiXkYD_Ih5oPkQ-XxIB8XH90QKsMrneflmM1MjsHpyxD7HG28C4)' }}
                        />
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Alex Rivers
                                <span className="text-[10px] bg-[#8655f6]/20 text-[#8655f6] px-2 py-0.5 rounded-full border border-[#8655f6]/30">PRO USER</span>
                            </h1>
                            <p className="text-sm text-slate-400">Member since Oct 2023</p>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className="font-bold">24 <span className="font-normal text-slate-500">Events</span></span>
                                <span className="font-bold">12 <span className="font-normal text-slate-500">Reviews</span></span>
                            </div>
                        </div>
                    </div>
                    <button className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors">Edit Profile</button>
                </div>

                {/* Tickets Section */}
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#8655f6] rounded-full" /> Upcoming Tickets
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[320px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:shadow-[0_0_20px_rgba(134,85,246,0.2)] transition-all">
                            <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(https://picsum.photos/400/200?random=${i})` }}>
                                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold border border-white/20">UPCOMING</span>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg mb-1">Neon Lights Festival</h3>
                                <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">calendar_month</span> Dec 12 • 8:00 PM
                                </p>
                                <button className="w-full py-2 bg-[#8655f6] rounded-lg text-sm font-bold hover:bg-[#7f0df2]">View QR</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};
