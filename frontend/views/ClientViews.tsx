import React from 'react';

// --- Components ---

export const ClientHome: React.FC = () => {
  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-y-auto bg-[#151022]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#2d2839] bg-[#151022]/80 backdrop-blur-md px-4 md:px-10 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-[#8655f6] to-[#d946ef] text-white shadow-[0_0_15px_rgba(137,90,246,0.5)]">
              <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
            </div>
            <h2 className="hidden md:block text-white text-xl font-bold tracking-tight">TicketVibe</h2>
          </div>
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <label className="flex w-full items-center h-11 rounded-xl bg-[#2d2839]/50 border border-white/5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all overflow-hidden">
              <div className="flex items-center justify-center pl-4 text-[#a59cba]">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input className="w-full bg-transparent border-none text-white placeholder:text-[#a59cba] focus:ring-0 px-3 text-sm font-normal" placeholder="Search events, artists, or venues..." />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-10 items-center justify-center px-6 rounded-xl bg-[#8655f6] hover:bg-[#7f0df2] text-white text-sm font-bold shadow-[0_4px_14px_0_rgba(137,90,246,0.39)] transition-all transform hover:scale-105">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative w-full min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-[#151022]/80 to-transparent z-10"></div>
          <img alt="Concert" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT7K98ACs9vSfWQJt6l98gKBFXGVc38ShpjT8RCOhtRLtf6Ln3C9-S-dqANQv7H0a4rbWE1B9NP8y1e109gSd0Zj_-MkAHP6hPYeoklUrPg6VTM-f_KsMk_CLC6nO7gJ4Crv28pUo9DVBTVA5pK0lR34RTkxamij83oLj22VJKOdD0dCkS2oKWxtBEJONPQ1Z6cJD5TKpb4BYwGwcgPnKglqMo5W_z-2Sd7VzM0wGBqJM0mKQ-knGZaMM0KFyud3hDkWe-FGeHw4Ft" />
        </div>
        <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-4 pt-10 pb-20">
          <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-[#8655f6] mb-6 shadow-[0_0_20px_rgba(137,90,246,0.3)]">
            <span className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse"></span>
            Live Now
          </span>
          <h1 className="text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6 drop-shadow-2xl">
            Experience the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#8655f6] to-[#d946ef]">Music Live</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-normal max-w-2xl mb-10 leading-relaxed">
            Secure your spot at the hottest events this season. From underground raves to stadium tours, feel the beat of the city.
          </p>
          <button className="h-14 px-8 rounded-xl bg-[#8655f6] text-white text-base font-bold shadow-[0_0_40px_rgba(137,90,246,0.6)] hover:bg-[#7f0df2] transition-all transform hover:-translate-y-1 flex items-center gap-2">
            <span>Book Now</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative z-30 px-4 -mt-16 md:-mt-20 mb-12">
        <div className="max-w-[1100px] mx-auto glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl">
          <form className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                <span className="material-symbols-outlined">event_note</span>
              </div>
              <input className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#8655f6]/50 placeholder:text-gray-500" placeholder="Event or Artist" type="text" />
            </div>
            <div className="md:col-span-3 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <select className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-10 focus:ring-2 focus:ring-[#8655f6]/50 appearance-none">
                <option>New York</option>
                <option>Los Angeles</option>
              </select>
            </div>
            <div className="md:col-span-3 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <input className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#8655f6]/50" type="date" />
            </div>
            <div className="md:col-span-2">
              <button className="w-full h-14 bg-gradient-to-r from-[#8655f6] to-[#7c3aed] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2" type="button">
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
          {[
            { title: "Midnight Bass Festival", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDi6Oy71QOrOhpI-eEIZzHCZiMS_yadvN2UnsBAJsc0c9onFTs33e__ir4YWKaYR6eM-SDx4P9LmTzvTfsjNZ9DeRiTs97ZsBA6xSbHFhbu__IpgbqKDQ5AoKI6LL13YZQO-uKaKWYpRDe1Z2yfGY4HZU3DTsc68i27BNEhYnNebUw1ty7S9Qx6n1LG7aO2ruJdhaWzl8zC0KLUYm2ILm8ZxUWXNhcq72VRo79cKc3NBeZSrp43nmH9skeO7byVQjk2AtdTux1kRS8y", date: "24", month: "Oct" },
            { title: "Neon Nights Tour", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh2nqKN4dfkx_cnZP0iEoY6bSjZJ2uWrgMWMWS5wh7Z9fTX6PgHxZ7ky5mQfWkEdEf0qDNz9UCg4T7FksyVeOsLxyiFiMmDLFdMnaEpnfhOJF2l0dwITFrO7s4pabD4_nJ0rV9j3ACNr_0BY65jkg7nkXJaT5JPZq1nPyXaahJ0kdvQXQvsdG9RzjP-_nXJsfSFXouAfy45ZUVDd4TrMzlqVYGdR5nhExRtrP2CilHZc_zB_j_JBySSP5jZLzAsdGntY9ORv_A_ji8", date: "02", month: "Nov" },
            { title: "Acoustic Sunday", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFKPgI3neKtoFLBwPHGnnXGqo02lVoYR8smPkzZuw0v4uA8i-ElOrDFw3nBgytl9QfPLf4Pstk9Xr87Q1H1zO8zJAkmSvi65XrvvQ3_J2K6hxLWyihYprE53gPYkq4-nBrlOlpcdRj6YHFO4kVOCAMtR8XmWbVTzOofALc4ublWwNmICgw-dPzj8QaR9_KNLQmmZtmwRgA6lfF6rje9LCkNVsW8WtobqNNm3J1NQVmWBxqrj0gEaUujGxQRVcZyweFCpNZ0x-LZvHW", date: "15", month: "Nov" },
            { title: "Rock Symphony", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNvJZmi9V4NuAXXmRFmR0AQBPcNn93Q0QeSAH3yrkfuos3hgrksYSMjDa7mZAWddPAMZxnJfFeaskiVRgn84KM10C65miITV1ibQkM0oOkkPix9aXLuqYx675Lzu2us2zqH1vX3Z5sBTWQOnfqsmS3Rn0QRJ9p5ZxQuOlyaqzcfXB6mm0eOF5CCg93H8m7vVHwA69_vZFchTwmfpwF3K_n4YD4S-Pj2Uhzj5_ueN6yB8YrbPeS3ObDyQ0cuHbzHlOrq74TJhWOQFGF", date: "05", month: "Dec" },
          ].map((item, i) => (
            <div key={i} className="glass-panel rounded-2xl overflow-hidden group flex flex-col h-full bg-white/5 border border-white/5 hover:border-[#8655f6]/30 hover:shadow-[0_10px_30px_-10px_rgba(137,90,246,0.2)] transition-all">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 text-center min-w-[60px]">
                  <p className="text-xs font-bold text-[#8655f6] uppercase">{item.month}</p>
                  <p className="text-xl font-bold text-white leading-none">{item.date}</p>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-sm text-gray-400">From $50</span>
                  <button className="px-4 py-2 rounded-lg border border-[#8655f6] text-[#8655f6] font-bold hover:bg-[#8655f6] hover:text-white transition-all text-sm">Buy Ticket</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SearchResults: React.FC = () => {
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
                {Array.from({ length: 31 }, (_, i) => i + 1).slice(0, 14).map(d => (
                  <div key={d} className={`h-7 flex items-center justify-center rounded ${d === 5 || d === 10 ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white' : 'text-gray-400'}`}>{d}</div>
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
               <div className="absolute left-1/4 right-1/4 h-full bg-gradient-to-r from-[#a855f7] to-[#ec4899]"></div>
               <div className="absolute left-1/4 -top-1.5 w-4 h-4 bg-white rounded-full"></div>
               <div className="absolute right-1/4 -top-1.5 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </aside>

        {/* Main Results */}
        <section className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black mb-1">Results for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#ec4899]">"music"</span></h1>
              <p className="text-gray-400 font-medium">42 events found</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {/* Result Card */}
             {[1,2,3,4,5,6].map((i) => (
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
                     <button className="bg-[#ec4899]/10 text-[#ec4899] px-4 py-2 rounded-lg text-sm font-bold hover:bg-gradient-to-r hover:from-[#a855f7] hover:to-[#ec4899] hover:text-white transition-all">Get Tickets</button>
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

export const EventDetails: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#151022] text-white">
      <div className="w-full h-[450px] relative">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO6O6_GS5zOq5KquXUroZhSksr1uonwL0IwXRWAJzcNxazCWswLLUalYasfdLfHnrqqKL4cPQZGlxYekLWCtOxBzz7eHBXnlx911eRTrH8tu1oFksiohQWdw_lGYt3KCxbVlxQR5qcOGek59GwTIrfRrfk_DjGv1QOVnC_F6lR8sGlSAUDiXYCz-BS7O_5J-6wYVA_r0zMPehkF9DCCIa04pV3yIoXwwztd5nxTwC1dz_JtIMUEyFsi_7PRHOsWAJckw4Rg1Be2iZV" className="w-full h-full object-cover" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-[#151022]/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-[1280px] mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">Neon Nights Festival 2024</h1>
          <p className="text-xl font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[#8655f6]">calendar_month</span> Sep 24, 2024 • 8:00 PM</p>
        </div>
      </div>
      <main className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-3 gap-4 border-y border-[#2d2839] py-6 mb-8">
             <div className="flex gap-4 items-center"><span className="p-3 rounded-full bg-[#2d2839] text-[#a59cba] material-symbols-outlined">calendar_today</span><div><p className="text-[#a59cba] text-sm">Date</p><p className="font-medium">Sat, Sep 24</p></div></div>
             <div className="flex gap-4 items-center"><span className="p-3 rounded-full bg-[#2d2839] text-[#a59cba] material-symbols-outlined">schedule</span><div><p className="text-[#a59cba] text-sm">Time</p><p className="font-medium">8:00 PM</p></div></div>
             <div className="flex gap-4 items-center"><span className="p-3 rounded-full bg-[#2d2839] text-[#a59cba] material-symbols-outlined">location_on</span><div><p className="text-[#a59cba] text-sm">Venue</p><p className="font-medium">Grand Arena</p></div></div>
          </div>
          <h2 className="text-2xl font-bold mb-4">About the Event</h2>
          <p className="text-gray-300 leading-relaxed mb-8">Get ready for the most electrifying night of the year! Neon Nights Music Festival returns with a bigger lineup, louder bass, and an immersive light show.</p>
          <h2 className="text-2xl font-bold mb-4">Line-up</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="flex flex-col items-center gap-3 shrink-0">
                 <div className="w-24 h-24 rounded-full border-2 border-[#8655f6] p-1"><img src={`https://picsum.photos/100?random=${i}`} className="w-full h-full rounded-full object-cover" alt="Artist"/></div>
                 <p className="text-center font-medium">Artist {i}</p>
               </div>
             ))}
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-[#2d2839]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Select Tickets</h3>
            {['General Admission', 'VIP Access'].map((type, i) => (
              <div key={type} className="mb-4 p-4 rounded-xl border border-[#2d2839] bg-[#1e1a29]/50 hover:border-[#8655f6]/50 transition-all cursor-pointer">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{type}</span>
                  <span className="font-bold">${i === 0 ? 45 : 120}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-green-400 flex items-center gap-1"><span className="material-symbols-outlined text-xs">check_circle</span> Available</span>
                  <button className="w-8 h-8 rounded bg-[#2d2839] hover:bg-[#8655f6] flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
                </div>
              </div>
            ))}
            <button className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-[#8655f6] to-[#a87ffb] text-white font-bold shadow-lg hover:shadow-[#8655f6]/40 transition-all">Checkout</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export const ZoneSelection: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#151022] text-white p-6 flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black">Select Your Zone</h1>
          <p className="text-[#a59cba]">Tomorrowland 2024 • Main Stage</p>
        </div>
        <div className="flex gap-3">
          <span className="px-3 py-1 rounded-full bg-[#2d2839] border border-white/5 text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#8655f6]"></span> VIP</span>
          <span className="px-3 py-1 rounded-full bg-[#2d2839] border border-white/5 text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Standard</span>
        </div>
      </header>
      <div className="flex-1 bg-[#1e1a29] rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
        {/* Stage */}
        <div className="absolute top-10 w-1/3 h-20 bg-gradient-to-b from-[#2d2839] to-transparent border-t-4 border-gray-600 rounded-t-[50%] flex items-center justify-center">
          <span className="text-gray-500 font-bold uppercase tracking-[0.3em]">Stage</span>
        </div>
        {/* Zones */}
        <div className="grid grid-cols-2 gap-8 w-2/3 mt-20">
           <div className="aspect-square bg-[#8655f6]/20 border-2 border-[#8655f6] rounded-2xl flex flex-col items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(134,85,246,0.3)]">
             <span className="font-bold text-xl">Zone A</span>
             <span className="text-[#8655f6] text-sm font-bold mt-1">VIP</span>
             <div className="mt-2 bg-[#8655f6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Selected</div>
           </div>
           <div className="aspect-square bg-[#2d2839] hover:bg-[#8655f6]/10 border border-white/10 hover:border-[#8655f6]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all">
             <span className="font-bold text-xl">Zone B</span>
             <span className="text-gray-400 text-sm mt-1">Standard</span>
           </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-[#151022]/90 backdrop-blur border-t border-white/10 p-6">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-16 bg-gray-700 rounded-lg"></div>
            <div>
              <h3 className="font-bold">Zone A (VIP)</h3>
              <p className="text-sm text-[#a59cba]">2 Tickets</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-[#a59cba] uppercase font-bold">Total</p>
              <p className="text-2xl font-black">2,000,000 VND</p>
            </div>
            <button className="bg-gradient-to-r from-[#8655f6] to-[#a855f7] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:brightness-110 transition-all">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Checkout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-6">Payment Details</h1>
          <div className="bg-[#1e293b]/40 backdrop-blur border border-white/5 rounded-xl p-8">
            {/* Visual Card */}
            <div className="mb-8 w-full md:w-[320px] aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-[#8655f6] to-[#ec4899] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
              <div className="flex justify-between items-start z-10">
                <div className="w-12 h-8 bg-white/20 rounded"></div>
                <span className="font-bold italic">VISA</span>
              </div>
              <div className="z-10">
                <p className="font-mono text-xl tracking-widest mb-4">•••• •••• •••• 4242</p>
                <div className="flex justify-between text-xs uppercase tracking-wider opacity-80">
                  <span>John Doe</span>
                  <span>12/28</span>
                </div>
              </div>
            </div>
            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Card Number</label>
                <input className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-3 text-white focus:ring-[#8655f6]" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Expiry Date</label>
                  <input className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-3 text-white focus:ring-[#8655f6]" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">CVC</label>
                  <input className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-3 text-white focus:ring-[#8655f6]" placeholder="123" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-[#1e293b]/60 backdrop-blur border border-white/5 rounded-xl p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 rounded bg-gray-700 bg-cover bg-center" style={{backgroundImage: 'url(https://picsum.photos/200)'}}></div>
              <div>
                <h4 className="font-bold">Neon Nights Festival</h4>
                <p className="text-xs text-gray-400">Sat, Oct 14 • 8:00 PM</p>
              </div>
            </div>
            <div className="border-t border-white/10 py-4 space-y-2">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>$300.00</span></div>
              <div className="flex justify-between text-sm"><span>Service Fee</span><span>$15.00</span></div>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-end mb-6">
              <span className="text-gray-400">Total</span>
              <span className="text-3xl font-bold">$315.00</span>
            </div>
            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold hover:shadow-lg transition-all">Confirm and Pay</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti / Flares */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8655f6]/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#ec4899]/20 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="relative z-10 text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#8655f6] to-[#ec4899] mb-6 shadow-[0_0_30px_rgba(134,85,246,0.5)]">
          <span className="material-symbols-outlined text-4xl text-white font-bold">check</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-slate-400 text-lg">Get ready for an unforgettable night!</p>
      </div>

      <div className="w-full max-w-md bg-gradient-to-b from-[#1e293b]/80 to-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Ticket Notch */}
        <div className="absolute top-2/3 left-0 -translate-x-1/2 w-8 h-8 bg-[#0f172a] rounded-full"></div>
        <div className="absolute top-2/3 right-0 translate-x-1/2 w-8 h-8 bg-[#0f172a] rounded-full"></div>
        <div className="absolute top-2/3 left-4 right-4 border-b-2 border-dashed border-white/10"></div>

        <div className="h-48 bg-cover bg-center relative" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuB8nbNnvVgU7NFW_iFrEWB2dreeoG-BC9Tyo4Sq87BZ07rqEibTpIyefRg1iehpOjcw5bmNuxaIs83IQY_P5H5qOiWakHho2GQbYmwSEPbdQxapNnoO7K0a70m_OVFTgS2JQVeeFZOD_H3ugM5l02JuBnlDU_Qeb0ENJ8phi6uO47etbvWxyLvByvaSCyxoi_GMkngxYm4mtG4Um52-Gwio0AY9KZfnQ7NcMx6p_dGInmImfq9Z6lqd5D8Dh62DEktgkVV7geSqnPeI)'}}>
          <div className="absolute bottom-4 left-6">
            <span className="px-3 py-1 bg-[#8655f6] text-white text-xs font-bold rounded-full">VIP ACCESS</span>
            <h2 className="text-2xl font-bold text-white mt-2">Neon Nights 2024</h2>
          </div>
        </div>
        <div className="p-6 pt-8 space-y-4">
           <div className="flex justify-between">
             <div><p className="text-xs text-gray-400 uppercase">Date</p><p className="font-semibold">Oct 14, 2024</p></div>
             <div className="text-right"><p className="text-xs text-gray-400 uppercase">Time</p><p className="font-semibold">8:00 PM EST</p></div>
           </div>
           <div><p className="text-xs text-gray-400 uppercase">Venue</p><p className="font-semibold">Cyber Arena, NY</p></div>
        </div>
        <div className="p-6 bg-white/5 flex flex-col items-center justify-center">
           <div className="bg-white p-2 rounded-lg mb-2"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TicketVibe" alt="QR" className="w-24 h-24" /></div>
           <p className="text-xs text-gray-500 font-mono">ID: 8X92-MM92-K291</p>
        </div>
      </div>

      <div className="flex gap-4 mt-8 w-full max-w-md">
        <button className="flex-1 py-3 border border-gray-600 rounded-xl font-semibold hover:bg-white/5 transition-colors">Download PDF</button>
        <button className="flex-1 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-xl font-bold hover:shadow-lg transition-all">Go to My Tickets</button>
      </div>
    </div>
  );
}

export const UserProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      {/* Side Nav */}
      <aside className="w-64 p-6 flex flex-col gap-8 border-r border-white/5 hidden lg:flex">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 bg-cover bg-center" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAzQLjgCEZYT3Z1IquCHXVgRti4HN_IpR_ZI0626Xzmeo3jOq-mu0Nuow6DAApb6_rdyvuJhEq2q4hznXrT-Tgc1j5VnI-51JhxVBWR7FEwUD2q9WALOhWYKjo9JrV0tgBCH6Zq71AptCBLtxXhXyAGE9j3a-oW2efRycH7sNIKmq7UxRZhJwGo84k07maxd5CQyvHkEqQ0H_VlIdBqwF37eOg2TYpFsykyVyw28QBrHxtqkqLy4UJob9hPCFGjat0mGBGT_keoitGd)'}}></div>
          <div><h2 className="font-bold">Alex Rivers</h2><span className="text-xs text-[#8655f6] font-bold uppercase">Elite Attendee</span></div>
        </div>
        <nav className="flex flex-col gap-2">
          {['My Tickets', 'Favorites', 'Profile Settings', 'Payment Methods'].map(item => (
            <a key={item} href="#" className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${item === 'My Tickets' ? 'bg-[#8655f6] text-white shadow-lg shadow-[#8655f6]/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{item}</a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Profile Header */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full border-4 border-[#8655f6]/30 bg-gray-700 bg-cover bg-center" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuADu6W6U_wGI3hym-PUPGAnLt7ZADKR5c8VG8hffkvrKXc82rcFJNoeMq-2xzzeurC8HL7sVa6TA1Ro5bnVjAgVgtNWVwS343oJOCBHE9bttCOAArQoSS3-rpX99NvIxX5npXx64EdN1npCxvBrShPfiPaufbrsNEHjtJ3eprgPJblM5ZvnWlI-0-0WRiWFtz7OnNCvBLW0by-5ufXLkll41aUhHyiXkYD_Ih5oPkQ-XxIB8XH90QKsMrneflmM1MjsHpyxD7HG28C4)'}}></div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">Alex Rivers <span className="text-[10px] bg-[#8655f6]/20 text-[#8655f6] px-2 py-0.5 rounded-full border border-[#8655f6]/30">PRO USER</span></h1>
              <p className="text-sm text-slate-400">Member since Oct 2023</p>
              <div className="flex gap-4 mt-2 text-sm"><span className="font-bold">24 <span className="font-normal text-slate-500">Events</span></span><span className="font-bold">12 <span className="font-normal text-slate-500">Reviews</span></span></div>
            </div>
          </div>
          <button className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors">Edit Profile</button>
        </div>
        {/* Tickets Section */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="w-1.5 h-6 bg-[#8655f6] rounded-full"></span> Upcoming Tickets</h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {[1,2,3].map(i => (
            <div key={i} className="min-w-[320px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:shadow-[0_0_20px_rgba(134,85,246,0.2)] transition-all">
              <div className="h-40 bg-cover bg-center relative" style={{backgroundImage: `url(https://picsum.photos/400/200?random=${i})`}}>
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold border border-white/20">UPCOMING</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">Neon Lights Festival</h3>
                <p className="text-xs text-slate-400 mb-4 flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span> Dec 12 • 8:00 PM</p>
                <button className="w-full py-2 bg-[#8655f6] rounded-lg text-sm font-bold hover:bg-[#7f0df2]">View QR</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export const TicketModal: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-[450px] bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
        <button className="absolute top-4 right-4 text-white/50 hover:text-white z-10"><span className="material-symbols-outlined">close</span></button>
        <div className="h-48 bg-cover bg-center relative" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAVuTTDcGB9DiGgKHtCP4JN_6hDkPJLwgvPV86DjXdFVhlzHz62nrdSLk_BJrZ63VxV35M-3kYG6zqe8UXsDl_9CJ3-c7H9Mpnwu-_IWvPxRl9SR6QhufC7tQYauLG9Ap0pyyBJp_oD3y3HNdlCTkkzf19-oggnI5T0FXKptGG1v8ue2dbhmEeVPslUC2jwRMp4cfp6P8cldpS9muGhRm-mePDgwCkhnnPbjK8FDuMw_Sp0C7yDxJ-xCJuiN3TXQvt9xKvBegQv83CA)'}}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
          <div className="absolute bottom-4 left-6">
            <h2 className="text-2xl font-bold text-white">Neon Nights 2024</h2>
            <p className="text-[#7f0df2] text-sm font-bold uppercase tracking-widest">Confirmed Admission</p>
          </div>
        </div>
        <div className="flex justify-center py-6">
          <div className="bg-white p-3 rounded-xl shadow-[0_0_30px_rgba(127,13,242,0.3)]">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TicketVibeEntry" alt="QR" className="w-40 h-40" />
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mb-6 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[#7f0df2]">qr_code_scanner</span> Scan at Entrance
        </div>
        <div className="grid grid-cols-2 gap-y-6 px-8 pb-8 text-sm border-t border-white/10 pt-6">
          <div><p className="text-gray-500 text-xs font-bold uppercase">Ticket Type</p><p className="text-white font-bold">VIP Access</p></div>
          <div><p className="text-gray-500 text-xs font-bold uppercase">Order ID</p><p className="text-white font-bold">#123456</p></div>
          <div><p className="text-gray-500 text-xs font-bold uppercase">Date & Time</p><p className="text-white font-bold">Oct 24 • 8PM</p></div>
          <div><p className="text-gray-500 text-xs font-bold uppercase">Seat</p><p className="text-white font-bold">Row 12, 04</p></div>
        </div>
        <div className="p-6">
          <button className="w-full py-4 rounded-xl border border-[#7f0df2]/30 text-white font-bold flex items-center justify-center gap-2 hover:bg-[#7f0df2]/10 transition-colors">
            <span className="material-symbols-outlined">file_download</span> Download Ticket PDF
          </button>
        </div>
      </div>
    </div>
  );
}