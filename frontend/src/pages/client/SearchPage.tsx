import React from 'react';

export const SearchPage: React.FC = () => {
    return (
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
                                Results for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#ec4899]">"music"</span>
                            </h1>
                            <p className="text-gray-400 font-medium">42 events found</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="group bg-[#12161d] rounded-xl overflow-hidden border border-[#1a1f26] hover:border-[#d946ef] transition-all">
                                <div className="relative h-48">
                                    <img src={`https://picsum.photos/400/300?random=${i}`} className="w-full h-full object-cover" alt="Event" />
                                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur text-white">
                                        <span className="material-symbols-outlined text-sm">favorite</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <span className="text-[#a855f7] text-[11px] font-bold uppercase">Concert</span>
                                    <h3 className="text-lg font-bold mb-1 text-white group-hover:text-[#d946ef]">Neon Horizons</h3>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1a1f26]">
                                        <span className="text-xl font-black text-[#ec4899]">$89.00</span>
                                        <button className="bg-[#ec4899]/10 text-[#ec4899] px-4 py-2 rounded-lg text-sm font-bold hover:bg-gradient-to-r hover:from-[#a855f7] hover:to-[#ec4899] hover:text-white transition-all">
                                            Get Tickets
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
