import React, { useState } from 'react';
import { Sidebar } from '../components/navigation/Sidebar';
import { organizerSidebarItems } from '../constants/navigation';

interface OrganizerLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({
    children,
    title,
}) => {
    const [activePath, setActivePath] = useState('/organizer');

    return (
        <div className="flex min-h-screen bg-[#0f0f12] text-white">
            <Sidebar
                items={organizerSidebarItems}
                activePath={activePath}
                onNavigate={setActivePath}
                variant="organizer"
                subtitle="Organizer Portal"
            />
            <main className="flex-1 p-8 overflow-y-auto">
                {title && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">{title}</h1>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
};
