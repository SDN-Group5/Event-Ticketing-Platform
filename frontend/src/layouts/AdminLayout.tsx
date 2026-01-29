import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/navigation/Sidebar';
import { adminSidebarItems } from '../constants/navigation';
import { useLocation } from 'react-router-dom';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    const location = useLocation();
    const [activePath, setActivePath] = useState(location.pathname);

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-sans">
            <Sidebar
                items={adminSidebarItems}
                activePath={activePath}
                onNavigate={setActivePath}
                variant="admin"
                subtitle="Admin Panel"
                logo={
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#a855f7] to-[#d946ef] flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-lg">confirmation_number</span>
                    </div>
                }
            />
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-[#0f1219]/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
                    <div className="relative w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                        <input
                            className="w-full bg-slate-800/50 border-none rounded-lg pl-10 py-1.5 text-sm text-slate-200 focus:ring-1 focus:ring-[#d946ef]"
                            placeholder="Search..."
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative">
                            <span className="material-symbols-outlined text-slate-400">notifications</span>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[#d946ef] rounded-full" />
                        </button>
                        <div className="h-8 w-8 rounded-full bg-slate-700" />
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
