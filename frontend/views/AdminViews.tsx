import React from 'react';

const AdminLayout: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
  <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-sans">
    <aside className="w-64 border-r border-slate-800 bg-[#0f1219] flex-col hidden md:flex sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#a855f7] to-[#d946ef] flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-white text-lg">confirmation_number</span></div>
        <h1 className="text-lg font-bold">TicketVibe</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {['Dashboard', 'Event Queue', 'Organizers', 'Analytics', 'Settings'].map(item => (
          <a key={item} href="#" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${title === item || (title === 'User Management' && item === 'Organizers') ? 'bg-[#d946ef]/10 text-[#d946ef]' : 'text-slate-400 hover:bg-slate-800'}`}>
            <span className="material-symbols-outlined text-sm">{item === 'Dashboard' ? 'dashboard' : item === 'Event Queue' ? 'inbox' : item === 'Organizers' ? 'group' : 'settings'}</span>
            <span className="text-sm font-medium">{item}</span>
          </a>
        ))}
      </nav>
    </aside>
    <main className="flex-1 overflow-y-auto">
      <header className="h-16 border-b border-slate-800 bg-[#0f1219]/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
          <input className="w-full bg-slate-800/50 border-none rounded-lg pl-10 py-1.5 text-sm text-slate-200 focus:ring-1 focus:ring-[#d946ef]" placeholder="Search..." />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative"><span className="material-symbols-outlined text-slate-400">notifications</span><span className="absolute top-0 right-0 w-2 h-2 bg-[#d946ef] rounded-full"></span></button>
          <div className="h-8 w-8 rounded-full bg-slate-700"></div>
        </div>
      </header>
      <div className="p-8 max-w-7xl mx-auto">{children}</div>
    </main>
  </div>
);

export const AdminPayouts: React.FC = () => {
  return (
    <AdminLayout title="Organizer Payouts">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { l: 'Total Paid (MTD)', v: '$1.24M', c: 'text-emerald-400', i: 'payments' },
          { l: 'Pending Requests', v: '42', c: 'text-slate-500', i: 'hourglass_top' },
          { l: 'Avg Settlement', v: '1.5 Days', c: 'text-[#a855f7]', i: 'schedule' },
          { l: 'Platform Revenue', v: '12.5%', c: 'text-slate-500', i: 'account_balance' },
        ].map((s, i) => (
          <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:border-[#a855f7]/30 transition-colors">
            <div className="flex justify-between mb-2"><span className="text-slate-400 text-sm font-medium">{s.l}</span><span className={`material-symbols-outlined text-sm ${s.c === 'text-emerald-400' ? 'text-emerald-400' : 'text-[#a855f7]'}`}>{s.i}</span></div>
            <h3 className="text-2xl font-bold text-slate-100">{s.v}</h3>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between bg-slate-800/30">
          <h3 className="font-semibold text-slate-100 flex items-center gap-2">Pending Settlement Requests <span className="text-[10px] bg-[#d946ef]/10 text-[#d946ef] px-2 py-0.5 rounded-full border border-[#d946ef]/20 uppercase">Needs Review</span></h3>
          <button className="text-xs bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white px-3 py-1.5 rounded-lg font-bold">Export CSV</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/40 text-slate-400 text-xs uppercase">
            <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Event</th><th className="px-6 py-4">Organizer</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {[
              { id: '#PO-88210', evt: 'Neon Horizon', org: 'Lumina', amt: '$108,937.50' },
              { id: '#PO-88211', evt: 'Tech Summit', org: 'InnoVentures', amt: '$39,550.00' },
              { id: '#PO-88215', evt: 'Midnight Jazz', org: 'Blue Note', amt: '$11,243.75' }
            ].map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500 text-xs">{row.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-100">{row.evt}</td>
                <td className="px-6 py-4 text-slate-300">{row.org}</td>
                <td className="px-6 py-4 text-right font-bold text-[#d946ef]">{row.amt}</td>
                <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded border border-amber-500/20">Pending</span></td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500 hover:text-white"><span className="material-symbols-outlined text-lg">check</span></button>
                  <button className="p-1 bg-slate-800 text-slate-500 rounded hover:text-red-500"><span className="material-symbols-outlined text-lg">close</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export const AdminEventQueue: React.FC = () => {
  return (
    <AdminLayout title="Event Queue">
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-slate-800 bg-[#161a23]">
          <div className="flex justify-between mb-2 text-slate-400 text-sm font-medium"><span>Total Pending</span><span className="material-symbols-outlined text-[#d946ef]">pending_actions</span></div>
          <h3 className="text-2xl font-bold">24 Events <span className="text-xs text-[#d946ef]">+4 today</span></h3>
        </div>
        <div className="p-6 rounded-xl border border-slate-800 bg-[#161a23]">
          <div className="flex justify-between mb-2 text-slate-400 text-sm font-medium"><span>Avg Response</span><span className="material-symbols-outlined text-amber-500">timer</span></div>
          <h3 className="text-2xl font-bold">1.2 Hours</h3>
        </div>
        <div className="p-6 rounded-xl border border-slate-800 bg-[#161a23]">
          <div className="flex justify-between mb-2 text-slate-400 text-sm font-medium"><span>Priority</span><span className="material-symbols-outlined text-[#ec4899]">priority_high</span></div>
          <h3 className="text-2xl font-bold">5 Events</h3>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-6">Pending Review Queue</h2>
      <div className="space-y-4">
        {[
          { title: 'Neon Dreams: Summer Solstice', cat: 'Music', sub: 'Marcus Chen', time: '2 hours ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC30rMDCdXTHiywmBu9et8lGQ93unxxeK8lCmbFEh6jvlVeRwxxDfyt0PqjLfwRZHvP56skIhEB46BgNiPqImhk_6FoVbJQIoiHuj9fTVSC5WWdSiRZIz95XRUK--WXmbmlI8WGNuVlRLYvVYG4tGGdF2s5Y1QDEnec8Ox-Q50dRTS0niSw3DZxOaURPxIc8yE4YNLr6cXA2PCoC1goVcHca7FQMyhRUZdYc0CVojq1guxxnw8LqtwfzGncgQbX3tAu3bxVea1ds7Ks' },
          { title: 'Global AI Summit 2024', cat: 'Tech', sub: 'Sarah Jenkins', time: '5 hours ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXk5_1rY8KC-Rv3qjhtSC2udAJzSUwa5At6Xa9KMYD4ARnxZ-RkTWLM55zloPuvEaGZiiK3yGoDumgOkCxPzfLVnCgbeo_WS2yvuC4Oex6AjLQylHfbxR7Rzidgv2Hx5p6jUcwbtCuKrhwEuhc-qgHhJhzkaf-bkOYYjsO_jCmqEXJtRC8Y-OKpRI_EMfGD9MfamYjCTonVEq9IBEJwTk5y-w24BCDIMfY_-_k-kr47Rg_VHy-Xs1JjtLqH1kIAmB4NNXf_Wmx4kQD' },
          { title: 'City Marathon & Expo', cat: 'Sports', sub: 'David Miller', time: '8 hours ago', priority: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDx5Fu_bmWz6HhMfmSrq7fG6g4883YKDHhNWeOeYSsVPybYLGFyuAGz3eVK5gcq7_tuZQjLKRIZ3oX7nbOKNzRj0gLTLSqCKS_IZb8VRTUjQF8Lu8gR36PwG39v9cPkxQC2moTYNGYn5DYgWwSjXcc5KxftQx6xqEtoMs2R1JBG1heyEwlqtRzv-ylX9mzwVJkw7s1YUGhm1spOO4B2LI5txprXM5IkeoAh38k90_sXcQQzpmMLNvib8ZbiyJnmW-k2OKxWF1vitBj' }
        ].map((evt, i) => (
          <div key={i} className="bg-[rgba(22,27,38,0.4)] backdrop-blur border border-white/5 p-4 rounded-xl flex items-center gap-6 hover:bg-[rgba(22,27,38,0.6)] hover:border-[#d946ef]/30 transition-all">
            <div className="h-20 w-20 rounded-lg overflow-hidden shrink-0"><img src={evt.img} className="w-full h-full object-cover" alt="Event" /></div>
            <div className="flex-1">
              <div className="flex gap-3 mb-1"><h4 className="font-bold truncate">{evt.title}</h4><span className="px-2 py-0.5 rounded-full bg-[#d946ef]/10 text-[#d946ef] text-[10px] font-bold uppercase border border-[#d946ef]/20">{evt.cat}</span></div>
              <div className="flex gap-4 text-sm text-slate-400"><span>{evt.sub}</span><span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {evt.time}</span></div>
            </div>
            <div className="flex items-center gap-4">
              {evt.priority && <div className="px-3 py-1 bg-[#ec4899]/10 text-[#ec4899] rounded-full text-[11px] font-bold uppercase border border-[#ec4899]/20 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">priority_high</span> High Priority</div>}
              <button className="h-10 px-5 rounded-lg bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white font-bold text-sm shadow flex items-center gap-2 hover:scale-105 transition-transform"><span className="material-symbols-outlined text-lg">check_circle</span> Approve</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export const AdminUsers: React.FC = () => {
  return (
    <AdminLayout title="User Management">
      <div className="flex justify-between items-end mb-6">
        <div><h2 className="text-2xl font-bold">User Management</h2><p className="text-slate-400 text-sm">Manage platform participants.</p></div>
        <div className="text-right"><p className="text-xs font-bold text-[#ab9cba] uppercase">Total Users</p><p className="text-2xl font-bold">12,842</p></div>
      </div>
      <div className="bg-[#211b27]/40 border border-[#302839] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#211b27]/60 text-[#ab9cba] text-xs font-bold uppercase border-b border-[#302839]">
            <tr><th className="px-6 py-4">User ID</th><th className="px-6 py-4">Identity</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Reg Date</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-[#302839]">
            {[
              { id: '#TV-9021', name: 'Alex Rivers', email: 'alex@ticketvibe.com', role: 'Organizer', status: 'Active', date: 'Oct 12, 2023' },
              { id: '#TV-8842', name: 'Jordan Smith', email: 'jordan@gmail.com', role: 'Customer', status: 'Active', date: 'Oct 10, 2023' },
              { id: '#TV-8710', name: 'Casey Chen', email: 'casey@events.co', role: 'Organizer', status: 'Banned', date: 'Oct 08, 2023', statusColor: 'text-rose-500' }
            ].map((u, i) => (
              <tr key={i} className="hover:bg-[#211b27]/60 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-[#ab9cba]">{u.id}</td>
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-700"></div><div><p className="text-sm font-semibold">{u.name}</p><p className="text-xs text-[#ab9cba]">{u.email}</p></div></div></td>
                <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${u.role === 'Organizer' ? 'bg-[#7f0df2]/20 text-[#7f0df2]' : 'bg-slate-700/50 text-slate-300'}`}>{u.role}</span></td>
                <td className="px-6 py-4"><div className={`flex items-center gap-2 ${u.statusColor || 'text-emerald-400'}`}><span className="w-1.5 h-1.5 rounded-full bg-current"></span><span className="text-xs font-semibold">{u.status}</span></div></td>
                <td className="px-6 py-4 text-sm text-[#ab9cba]">{u.date}</td>
                <td className="px-6 py-4 text-right"><button className="text-[#ab9cba] hover:text-white"><span className="material-symbols-outlined">more_vert</span></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export const LayoutEditor: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-[#151022] text-white overflow-hidden">
      <header className="flex-none border-b border-[#2d2839] bg-[#1e1a29] px-6 py-3 flex justify-between items-center z-30 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-[#8655f6]"><span className="material-symbols-outlined text-2xl">confirmation_number</span><span className="font-bold text-lg text-white">TicketVibe</span></div>
          <div className="h-6 w-px bg-[#2d2839]"></div>
          <div className="text-sm"><span className="text-slate-400">Events / Madison Square Garden / </span><span className="text-[#8655f6] font-medium">Layout Editor</span></div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#2d2839]/50 px-3 py-1.5 rounded-full"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Auto-saved 2m ago</div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2d2839] hover:bg-[#2d2839]/80 rounded-xl text-sm font-bold">Preview</button>
          <button className="px-4 py-2 border border-[#2d2839] rounded-xl text-sm font-bold text-slate-400 hover:text-white">Exit</button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden relative">
        <aside className="w-64 flex-none bg-[#1e1a29] border-r border-[#2d2839] flex flex-col z-20 shadow-xl p-5 gap-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Toolkit</h3>
            <div className="grid grid-cols-2 gap-2">
              {['near_me', 'pan_tool', 'shapes', 'polyline'].map((icon, i) => (
                <button key={i} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-transparent transition-all ${i === 0 ? 'bg-[#8655f6] text-white shadow-lg shadow-[#8655f6]/20' : 'bg-[#2d2839] text-slate-300 hover:text-white'}`}>
                  <span className="material-symbols-outlined">{icon}</span><span className="text-xs font-medium">{['Select', 'Hand', 'Draw', 'Path'][i]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Layers</h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#8655f6]/10 border border-[#8655f6]/20 text-white cursor-pointer">
                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-slate-400 text-[18px]">drag_indicator</span><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-sm">VIP Section A</span></div>
                <div className="flex gap-1"><span className="material-symbols-outlined text-[16px] text-[#8655f6]">visibility</span></div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2d2839]/50 text-slate-400 cursor-pointer">
                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[18px]">drag_indicator</span><div className="w-2 h-2 rounded-full bg-[#8655f6]"></div><span className="text-sm">Main Stage</span></div>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1 bg-[#151022] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
          {/* Canvas Area */}
          <div className="relative w-[800px] h-[600px] bg-[#1a1625] shadow-2xl rounded-xl border border-white/5">
             <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[120px] border-2 border-[#8655f6] bg-[#8655f6]/10 rounded-lg flex flex-col items-center justify-center text-[#8655f6] font-bold tracking-widest uppercase">Stage</div>
             <div className="absolute top-[180px] left-[100px] w-[200px] h-[250px] border-2 border-rose-500 bg-rose-500/10 rounded-md flex flex-col items-center justify-center group cursor-move shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-2 ring-[#8655f6] ring-offset-2 ring-offset-[#1a1625]">
               <span className="text-rose-400 font-bold text-sm">VIP Section A</span><span className="text-rose-400/70 text-xs">50 Seats</span>
               {/* Handles */}
               <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-white border border-[#8655f6] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-white border border-[#8655f6] rounded-full translate-x-1/2 translate-y-1/2"></div>
             </div>
             <div className="absolute top-[180px] right-[100px] w-[200px] h-[250px] border border-emerald-500/50 bg-emerald-500/5 rounded-md flex flex-col items-center justify-center text-emerald-400"><span className="font-bold text-sm">Standard Section B</span><span className="text-xs opacity-70">120 Standing</span></div>
          </div>
        </main>
        <aside className="w-80 flex-none bg-[#1e1a29] border-l border-[#2d2839] flex flex-col z-20 shadow-xl">
           <div className="p-5 border-b border-[#2d2839]"><h3 className="text-sm font-bold text-white">Zone Properties</h3><p className="text-xs text-slate-400">Editing: <span className="text-[#8655f6]">VIP Section A</span></p></div>
           <div className="p-5 flex flex-col gap-5">
             <div className="space-y-3"><label className="text-xs font-semibold text-slate-400 uppercase">Zone Name</label><input type="text" value="VIP Section A" className="w-full bg-[#2d2839] border-transparent rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#8655f6] focus:ring-[#8655f6]" /></div>
             <div className="space-y-3">
               <label className="text-xs font-semibold text-slate-400 uppercase">Color</label>
               <div className="flex gap-3">
                 <button className="w-8 h-8 rounded-full bg-rose-500 ring-2 ring-white ring-offset-2 ring-offset-[#1e1a29]"></button>
                 <button className="w-8 h-8 rounded-full bg-emerald-500"></button>
                 <button className="w-8 h-8 rounded-full bg-blue-500"></button>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-semibold text-slate-400 uppercase">Capacity</label><input type="number" value="50" className="w-full bg-[#2d2839] border-transparent rounded-lg px-3 py-2.5 text-sm text-white" /></div>
               <div><label className="text-xs font-semibold text-slate-400 uppercase">Type</label><select className="w-full bg-[#2d2839] border-transparent rounded-lg px-3 py-2.5 text-sm text-white"><option>Seated</option></select></div>
             </div>
             <div className="pt-4 border-t border-[#2d2839]"><div className="flex justify-between text-xs text-slate-400 mb-2"><span>Projected Revenue:</span><span className="text-white font-bold">$7,500</span></div><button className="w-full py-3 bg-[#8655f6] hover:bg-[#8655f6]/90 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[20px]">save</span> Save Layout</button></div>
           </div>
        </aside>
      </div>
    </div>
  );
}