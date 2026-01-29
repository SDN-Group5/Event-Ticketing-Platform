import React from 'react';

const Sidebar: React.FC<{ active?: string }> = ({ active }) => (
  <aside className="w-64 border-r border-[#2d2839] bg-[#0f0f12] flex flex-col h-screen sticky top-0 hidden lg:flex">
    <div className="p-6 flex items-center gap-3">
      <div className="w-8 h-8 bg-[#8655f6] rounded-lg flex items-center justify-center text-white"><span className="material-symbols-outlined text-lg">confirmation_number</span></div>
      <h1 className="text-white font-bold text-lg">TicketVibe</h1>
    </div>
    <nav className="flex-1 px-4 space-y-2 mt-4">
      {['Dashboard', 'Events', 'Orders', 'Payouts', 'Team', 'Analytics', 'Settings'].map(item => (
        <a key={item} href="#" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active === item ? 'bg-[#8655f6]/10 text-[#8655f6]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
          <span className="material-symbols-outlined">{item === 'Dashboard' ? 'dashboard' : item === 'Events' ? 'calendar_month' : item === 'Orders' ? 'receipt_long' : item === 'Analytics' ? 'bar_chart' : item === 'Settings' ? 'settings' : 'circle'}</span>
          <span className="text-sm font-medium">{item}</span>
        </a>
      ))}
    </nav>
  </aside>
);

export const OrganizerHub: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#f6f5f8] dark:bg-[#0f0f12] text-slate-900 dark:text-white">
      <Sidebar active="Dashboard" />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-cover bg-center shadow-lg" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDKf-tSRtUuDs4uX7ou7uLckx9BBfn5MjZTm9_qAm2qhNwN4JwjW4BI9HrmPwlSwFVT45AYftcNa3ZiICRGPv5trEIex4OPctttjv9QzGkvGuyuOroWg54bQqBEyPd3Ce7YYw9rjQotO3AtcEQDAkXy5hz32K8jcCBJp9sEfYHpH4ss-kCCIX0pIov3Cuxc8f5VwszIJPFlJG5Kuw-wTVZw6E9Ae2mFFhrePdzq-xyF-agAcmjVa_PQsleK9lANTYwP24nzVGxp85yP)'}}></div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">Sonic Horizon Events <span className="material-symbols-outlined text-blue-400">verified</span></h1>
              <p className="text-gray-500 text-sm mt-1">12.5k Followers • 48 Events Hosted</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#8655f6] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#8655f6]/20">Share Profile</button>
            <button className="px-4 py-2 bg-white/10 border border-white/10 text-white rounded-lg text-sm font-bold hover:bg-white/20">Edit Profile</button>
          </div>
        </header>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Monthly Revenue', val: '$52,480', change: '+14.2%', icon: 'arrow_upward', color: 'text-emerald-500' },
            { label: 'Active Tickets', val: '1,894', change: '+5.8%', icon: 'arrow_upward', color: 'text-emerald-500' },
            { label: 'Avg. Occupancy', val: '92%', change: '~Top 5%', icon: 'trending_up', color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1e1e24] border border-[#2d2839] p-6 rounded-xl shadow-sm">
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
              <div className="flex justify-between items-end">
                <h3 className="text-3xl font-bold">{stat.val}</h3>
                <span className={`text-sm font-bold flex items-center ${stat.color}`}><span className="material-symbols-outlined text-sm">{stat.icon}</span> {stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Active Events */}
        <h2 className="text-2xl font-bold mb-6">Active Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-2 border-dashed border-[#2d2839] rounded-xl flex flex-col items-center justify-center p-8 hover:bg-[#8655f6]/5 hover:border-[#8655f6]/50 transition-all cursor-pointer group h-[380px]">
            <div className="w-14 h-14 bg-[#8655f6]/10 rounded-full flex items-center justify-center text-[#8655f6] mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-3xl">add</span></div>
            <h3 className="font-bold text-lg">Create New Event</h3>
            <p className="text-gray-500 text-sm text-center mt-2">Start selling tickets for your next venue or festival.</p>
          </div>
          {[
            { title: "Neon Abyss: Underground Techno", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8StppMjt2exwRuXWws47SMLHqROOR4CDpSTLDECaFx0jx7XiyiLnjjWPO8KxJxAgd6snzLoqklP_cCgT1SVyV5hWRCBGlpf5jGVJQmFyoDz9i1soNLztZRSzk4ngAwt2EJWHRnG2N_edD7S0qytYtoXBhs9ZXDMZHaMLFTo45RSmFDvripVyhtwHhmsFXeJOFQIAqsOJob_DWEoXG0ZHIS3EOmQtWXO3z3ThB2Aukx_LW8mSJkdsO2ljfcgNjbhm2TmHupWCHU4OK", sold: 78, status: "Live & Selling", color: "bg-emerald-500" },
            { title: "Deep Theory x Horizon Showcase", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCljoTYPpe5FBJ1e3OY7lL6C9EDYz_cLnFHGg1KofYjflPruicJbOT5pMEPQ3JFI2i-w0v1QlLTNzWa_U1IHLU5XWTxb3M_zwXr_7OfhfAStGnEcBXMNeIJY-4qPNYL2FzoNdvYLImomqBVGQjiVSd6M3WUYxJgp-ed7MbkTlodg41JHN-rTGAnY4F9IJgez9dLPbMULGTlkLosJXqOuUsSCPx1yOU5TDzd31LHB30ZpKi2kAf-F3gJJej40d06vC16ABv-JIGLWsSF", sold: 96, status: "Almost Sold Out", color: "bg-amber-500" }
          ].map((evt, i) => (
            <div key={i} className="bg-[#1e1e24] border border-[#2d2839] rounded-xl overflow-hidden group hover:shadow-2xl transition-all h-[380px] flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute top-3 left-3 px-3 py-1 text-white text-[10px] font-bold uppercase rounded-full tracking-wider z-10 ${evt.color}`}>{evt.status}</div>
                <img src={evt.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={evt.title} />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[#8655f6] text-xs font-bold uppercase mb-1">Sat, Oct 14 • 22:00</p>
                <h3 className="font-bold text-lg mb-4 line-clamp-2">{evt.title}</h3>
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-500">Sales Progress</span>
                    <span>{evt.sold}% Sold</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-[#8655f6]" style={{width: `${evt.sold}%`}}></div>
                  </div>
                  <button className="w-full py-2 bg-[#2d2839] hover:bg-[#3d364d] rounded-lg text-xs font-bold transition-colors">View Analytics</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export const OrganizerAdmin: React.FC = () => {
  // Similar structure to Hub but darker theme variant provided in snippet 5 (Dashboard Overview)
  return (
    <div className="flex min-h-screen bg-[#151022] text-white overflow-hidden">
      <aside className="w-64 bg-[#151022] border-r border-[#342f42] flex flex-col hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#895af6]/20 text-[#895af6] rounded-xl flex items-center justify-center"><span className="material-symbols-outlined filled">confirmation_number</span></div>
          <div><h1 className="font-bold text-lg">TicketVibe</h1><p className="text-xs text-gray-400">Organizer Admin</p></div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#895af6]/10 text-[#895af6]"><span className="material-symbols-outlined filled">dashboard</span><span className="text-sm font-medium">Overview</span></a>
          <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#1e1a29]"><span className="material-symbols-outlined">calendar_month</span><span className="text-sm font-medium">Events</span></a>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#895af6]/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div><h2 className="text-3xl font-bold">Dashboard Overview</h2><p className="text-gray-400">Welcome back, here's what's happening.</p></div>
            <button className="flex items-center gap-2 bg-[#895af6] hover:bg-[#895af6]/90 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#895af6]/20"><span className="material-symbols-outlined text-[20px]">add</span> Create New Event</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Total Revenue', val: '$45,231.00', icon: 'payments', trend: '12%', color: 'text-[#895af6]', bg: 'bg-[#895af6]/10' },
              { title: 'Tickets Sold', val: '1,204', icon: 'local_activity', trend: '5%', color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { title: 'Check-in Rate', val: '85%', icon: 'fact_check', trend: '-2%', color: 'text-orange-400', bg: 'bg-orange-400/10', trendColor: 'text-rose-500', trendBg: 'bg-rose-500/10', trendIcon: 'trending_down' },
              { title: 'Active Events', val: '4', icon: 'event', trend: '0%', color: 'text-purple-400', bg: 'bg-purple-400/10', trendIcon: 'remove', trendColor: 'text-gray-500', trendBg: 'bg-gray-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1e1a29] border border-[#342f42] p-5 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <span className={`material-symbols-outlined ${stat.color} ${stat.bg} p-1 rounded-lg`}>{stat.icon}</span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">{stat.val}</p>
                  <div className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${stat.trendBg || 'bg-emerald-500/10'} ${stat.trendColor || 'text-emerald-500'}`}>
                    <span className="material-symbols-outlined text-[14px]">{stat.trendIcon || 'trending_up'}</span> {stat.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-[#1e1a29] border border-[#342f42] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#342f42] flex justify-between items-center">
                <h3 className="font-bold text-lg">Live Events</h3>
                <button className="text-[#895af6] text-sm font-medium">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#1e1a29]/50 text-gray-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Event Name</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#342f42]">
                    {[
                      { name: 'Neon Nights Festival', date: 'Oct 24, 2023', status: 'Active', cap: 90, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { name: 'Tech Summit 2023', date: 'Nov 12, 2023', status: 'Draft', cap: 0, color: 'text-gray-400', bg: 'bg-gray-500/10' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-medium">{row.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{row.date}</td>
                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-opacity-20 ${row.color} ${row.bg}`}>{row.status}</span></td>
                        <td className="px-6 py-4"><div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-[#895af6]" style={{width: `${row.cap}%`}}></div></div></td>
                        <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-white"><span className="material-symbols-outlined">more_vert</span></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recent Orders List */}
            <div className="bg-[#1e1a29] border border-[#342f42] rounded-xl p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center"><h3 className="font-bold text-lg">Recent Orders</h3><span className="material-symbols-outlined text-gray-400">filter_list</span></div>
              {[
                { name: 'James Wilson', item: '2x Neon Nights VIP', price: '$150.00', time: '2m ago' },
                { name: 'Sarah Chen', item: '1x Tech Summit Gen...', price: '$299.00', time: '15m ago' }
              ].map((order, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#1e1a29] border border-[#342f42] hover:border-[#895af6]/30 cursor-pointer transition-all">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                    <div><p className="text-sm font-medium">{order.name}</p><p className="text-xs text-gray-500">{order.item}</p></div>
                  </div>
                  <div className="text-right"><p className="text-[#895af6] font-bold text-sm">{order.price}</p><p className="text-xs text-gray-600">{order.time}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const CreateEvent: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#191022] text-white font-display flex flex-col">
      <header className="sticky top-0 z-10 w-full bg-[#191022]/80 backdrop-blur border-b border-white/5 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex justify-between text-sm font-medium text-[#7f0df2]">
            <span>1. Basic Info</span>
            <span className="text-gray-600">2. Media & Tickets</span>
            <span className="text-gray-600">3. Review</span>
          </div>
          <div className="h-1.5 w-full bg-[#473b54] rounded-full overflow-hidden">
            <div className="h-full bg-[#7f0df2] w-1/3"></div>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black mb-2">Create New Event</h2>
          <p className="text-[#ab9cba] text-lg mb-10">Step 1: Tell us the basics.</p>
          
          <div className="space-y-10">
            <section className="bg-[#211b27] p-8 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-bold">Event Title</label>
                <input type="text" className="w-full bg-[#141118] border border-[#473b54] rounded-lg px-4 py-3.5 focus:border-[#7f0df2] focus:ring-1 focus:ring-[#7f0df2]" placeholder="e.g. Neon Nights" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-bold">Category</label>
                <select className="w-full bg-[#141118] border border-[#473b54] rounded-lg px-4 py-3.5 focus:border-[#7f0df2]"><option>Music & Concerts</option></select>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-bold">Description</label>
                <textarea className="w-full bg-[#141118] border border-[#473b54] rounded-lg px-4 py-3.5 h-32 focus:border-[#7f0df2]" placeholder="Describe your event..."></textarea>
              </div>
            </section>
            
            <section className="bg-[#211b27] p-8 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-[#7f0df2]">calendar_month</span> Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block mb-2 text-sm font-bold">Start Date</label><input type="date" className="w-full bg-[#141118] border border-[#473b54] rounded-lg px-4 py-3.5" /></div>
                <div><label className="block mb-2 text-sm font-bold">Start Time</label><input type="time" className="w-full bg-[#141118] border border-[#473b54] rounded-lg px-4 py-3.5" /></div>
              </div>
            </section>
          </div>
          
          <div className="mt-12 flex justify-end">
            <button className="bg-[#7f0df2] hover:bg-[#7f0df2]/90 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-[#7f0df2]/20 flex items-center gap-2">Next <span className="material-symbols-outlined">arrow_forward</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const AttendeeList: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className="w-64 border-r border-[#2d2d2d] bg-[#141414] hidden lg:flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 bg-[#7f0df2] rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-white">confirmation_number</span></div>
          <div><h1 className="font-bold text-lg leading-none">TicketVibe</h1><p className="text-[#ab9cba] text-xs">Organizer Portal</p></div>
        </div>
        <nav className="flex flex-col gap-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#ab9cba] hover:text-white hover:bg-white/5 rounded-lg"><span className="material-symbols-outlined">dashboard</span> Dashboard</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-[#7f0df2] text-white rounded-lg"><span className="material-symbols-outlined">group</span> Attendees</a>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="px-8 py-4 border-b border-[#2d2d2d] bg-[#141414]/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm"><span className="text-[#ab9cba]">Events</span> <span className="material-symbols-outlined text-xs text-[#ab9cba]">chevron_right</span> <span>Summer Music Fest 2024</span></div>
          <button className="bg-[#7f0df2] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">add</span> Create Event</button>
        </header>
        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-end mb-6">
            <div><h2 className="text-3xl font-black">Attendee Management</h2><p className="text-[#ab9cba]">Track ticket sales and check-ins.</p></div>
            <button className="border border-[#2d2d2d] bg-white/5 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/10"><span className="material-symbols-outlined text-[#7f0df2]">download</span> Export</button>
          </div>
          
          <div className="bg-[#141414] border border-[#2d2d2d] rounded-xl overflow-hidden">
            <div className="p-2 border-b border-[#2d2d2d] flex gap-4">
              <div className="relative flex-1"><span className="material-symbols-outlined absolute left-3 top-2.5 text-[#ab9cba]">search</span><input className="w-full bg-[#0a0a0a]/50 border-none rounded-lg pl-10 py-2.5 text-sm text-white" placeholder="Search..." /></div>
              <select className="bg-[#0a0a0a]/50 border-none rounded-lg text-sm text-white px-3"><option>All Status</option></select>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs text-[#ab9cba] font-bold uppercase border-b border-[#2d2d2d]">
                <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Qty</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d2d]">
                {[
                  { id: '#TV-8821', name: 'Jane Doe', email: 'jane@ex.com', type: 'VIP Pass', qty: 2, status: 'Checked-in', statusColor: 'text-green-400 bg-green-500/10 border-green-500/20' },
                  { id: '#TV-8822', name: 'John Smith', email: 'john@ex.com', type: 'General', qty: 1, status: 'Pending', statusColor: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-sm text-[#7f0df2]">{row.id}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7f0df2] to-purple-400 flex items-center justify-center font-bold text-xs">{row.name.substring(0,2)}</div><div><p className="text-sm font-semibold">{row.name}</p><p className="text-xs text-[#ab9cba]">{row.email}</p></div></div></td>
                    <td className="px-6 py-4 text-sm text-slate-300">{row.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{row.qty}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${row.statusColor}`}>{row.status}</span></td>
                    <td className="px-6 py-4 text-right"><button className="text-[#ab9cba] hover:text-white"><span className="material-symbols-outlined">more_vert</span></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export const OrganizerAnalytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white font-sans flex flex-col">
        {/* Simplified Header */}
        <header className="border-b border-white/10 px-8 py-3 flex items-center justify-between sticky top-0 bg-[#0a0c10]/90 backdrop-blur z-50">
            <div className="flex items-center gap-4 text-[#8655f6]"><span className="material-symbols-outlined text-3xl">confirmation_number</span><span className="text-white font-bold text-xl">TicketVibe</span></div>
            <nav className="flex gap-6 text-sm font-medium text-slate-400">
                <a href="#" className="text-[#8655f6] border-b-2 border-[#8655f6] pb-1">Dashboard</a>
                <a href="#" className="hover:text-white">Events</a>
                <a href="#" className="hover:text-white">Marketing</a>
            </nav>
            <div className="w-10 h-10 rounded-full bg-gray-700"></div>
        </header>
        <main className="p-8 md:px-20 lg:px-40 flex-1 overflow-y-auto">
            <div className="flex justify-between items-end mb-8">
                <div><h1 className="text-4xl font-black mb-2">Organizer Analytics</h1><p className="text-[#a59cba]">Comprehensive performance tracking</p></div>
                <button className="bg-[#1a1a1f] border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined">calendar_today</span> Last 30 Days</button>
            </div>
            
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Revenue', val: '$128,430', change: '+12.5%', color: 'text-emerald-500', icon: 'payments' },
                    { label: 'Conversion Rate', val: '3.24%', change: '+0.4%', color: 'text-emerald-500', icon: 'shopping_cart' },
                    { label: 'Check-ins', val: '4,200/5k', change: '-2.1%', color: 'text-orange-500', icon: 'qr_code_scanner' },
                    { label: 'Marketing ROI', val: '4.5x', change: '+0.8x', color: 'text-emerald-500', icon: 'insights' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-[#1a1a1f] border border-white/10 p-6 rounded-xl">
                        <div className="flex justify-between mb-2 text-[#a59cba] text-sm font-medium uppercase tracking-wider"><span>{kpi.label}</span><span className="material-symbols-outlined text-[#8655f6]">{kpi.icon}</span></div>
                        <p className="text-3xl font-bold">{kpi.val}</p>
                        <p className={`text-sm font-bold mt-1 ${kpi.color}`}>{kpi.change} <span className="text-slate-400 font-normal">vs last month</span></p>
                    </div>
                ))}
            </div>

            {/* Chart Area */}
            <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="flex justify-between mb-8">
                    <h3 className="text-xl font-bold">Ticket Sales Trends</h3>
                    <div className="flex gap-4 text-sm font-bold"><span className="text-[#8655f6] border-b-2 border-[#8655f6]">Month</span><span className="text-slate-400">Year</span></div>
                </div>
                {/* SVG Mock Chart */}
                <div className="w-full h-[300px] relative">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#8655f6" stopOpacity="0.3"></stop>
                                <stop offset="100%" stopColor="#8655f6" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        <path d="M0,250 Q100,200 200,220 T400,100 T600,200 T800,50 T1000,150 L1000,300 L0,300 Z" fill="url(#chartGradient)"></path>
                        <path d="M0,250 Q100,200 200,220 T400,100 T600,200 T800,50 T1000,150" fill="none" stroke="#8655f6" strokeWidth="4" filter="drop-shadow(0 0 10px rgba(134,85,246,0.5))"></path>
                        {/* Pink dashed line */}
                        <path d="M0,280 Q100,250 200,260 T400,200 T600,240 T800,150 T1000,200" fill="none" stroke="#ff00e5" strokeWidth="2" strokeDasharray="5,5" opacity="0.5"></path>
                    </svg>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#1a1a1f] border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between mb-6"><h3 className="text-xl font-bold">Top Performing Events</h3><button className="text-[#8655f6] text-sm font-bold">View All</button></div>
                    <table className="w-full text-left">
                        <thead className="text-[#a59cba] text-xs uppercase border-b border-white/5"><tr><th className="pb-3">Event Name</th><th className="pb-3">Tickets</th><th className="pb-3 text-right">Revenue</th><th className="pb-3 text-right">Status</th></tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { name: 'Cyberpunk Nights 2024', sold: '1,240', rev: '$45,200', status: 'Trending', color: 'text-emerald-500 bg-emerald-500/10' },
                                { name: 'Global Tech Summit', sold: '850', rev: '$32,150', status: 'Steady', color: 'text-[#8655f6] bg-[#8655f6]/10' },
                                { name: 'Neon Art Gallery', sold: '420', rev: '$18,900', status: 'Selling Fast', color: 'text-orange-500 bg-orange-500/10' }
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td className="py-4 font-bold">{row.name}</td>
                                    <td className="py-4 text-slate-400">{row.sold}</td>
                                    <td className="py-4 text-right font-bold">{row.rev}</td>
                                    <td className="py-4 text-right"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${row.color}`}>{row.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-6">Traffic Sources</h3>
                    <div className="space-y-4">
                        {[ {l:'Direct', v:'45%', c:'bg-[#8655f6]'}, {l:'Social Ads', v:'32%', c:'bg-[#ff00e5]'}, {l:'Email', v:'18%', c:'bg-slate-400'} ].map((item,i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-medium mb-1"><span>{item.l}</span><span>{item.v}</span></div>
                                <div className="w-full bg-white/5 rounded-full h-2"><div className={`h-full rounded-full ${item.c}`} style={{width: item.v}}></div></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-[#8655f6]/10 border border-[#8655f6]/20 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-[#8655f6]">auto_awesome</span>
                        <div><p className="text-xs font-bold text-[#8655f6] uppercase">AI Insight</p><p className="text-xs text-slate-300">Social ads are performing 24% better than last month.</p></div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}