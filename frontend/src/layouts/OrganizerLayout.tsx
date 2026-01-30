import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/navigation/Sidebar';
import { organizerSidebarItems } from '../constants/navigation';
import { useLocation } from 'react-router-dom';

interface OrganizerLayoutProps {
    children: React.ReactNode;
    title?: string;
    fullWidth?: boolean;
}

export const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({
    children,
    title,
    fullWidth = false,
}) => {
    const location = useLocation();
    const [activePath, setActivePath] = useState(location.pathname);

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-[#0f0f12] text-white">
            <Sidebar
                items={organizerSidebarItems}
                activePath={activePath}
                onNavigate={setActivePath}
                variant="organizer"
                subtitle="Organizer Portal"
            />
            <main className={`flex-1 overflow-y-auto ${fullWidth ? '' : 'p-8 max-w-7xl mx-auto'}`}>
                {children}
            </main>
        </div>
    );
};
