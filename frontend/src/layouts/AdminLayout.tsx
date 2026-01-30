import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/navigation/Sidebar';
import { adminSidebarItems } from '../constants/navigation';
import { useLocation } from 'react-router-dom';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    fullWidth?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, fullWidth = false }) => {
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
                {/* Content */}
                <div className={fullWidth ? "h-full" : "p-8 max-w-7xl mx-auto"}>
                    {children}
                </div>
            </main>
        </div>
    );
};
