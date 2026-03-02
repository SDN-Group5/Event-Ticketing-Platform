import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { useAuth } from '../contexts/AuthContext';

interface ClientLayoutProps {
    children: React.ReactNode;
    showNavbar?: boolean;
    showSearch?: boolean;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({
    children,
    showNavbar = true,
    showSearch = true,
}) => {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="relative flex flex-col min-h-screen w-full overflow-y-auto bg-[#151022]">
            {showNavbar && (
                <Navbar showSearch={showSearch} />
            )}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};
