import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { UserMenu } from './UserMenu';

interface NavbarProps {
    showSearch?: boolean;
    onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    showSearch = true,
    onLoginClick,
}) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const handleLoginClick = () => {
        if (onLoginClick) {
            onLoginClick();
        } else {
            navigate('/login');
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[#2d2839] bg-[#151022]/80 backdrop-blur-md px-4 md:px-10 py-3">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/')}
                >
                    <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-[#8655f6] to-[#d946ef] text-white shadow-[0_0_15px_rgba(137,90,246,0.5)]">
                        <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                    </div>
                    <h2 className="hidden md:block text-white text-xl font-bold tracking-tight">TicketVibe</h2>
                </div>

                {/* Search */}
                {showSearch && (
                    <div className="hidden md:flex flex-1 max-w-lg mx-4">
                        <SearchInput placeholder="Search events, artists, or venues..." />
                    </div>
                )}

                {/* Auth / User */}
                <div className="flex items-center gap-3">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3">
                            {/* Notification Button */}
                            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ec4899] rounded-full"></span>
                            </button>

                            {/* User Menu với Logout */}
                            <UserMenu
                                user={{
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                    avatar: user.avatar,
                                }}
                            />
                        </div>
                    ) : (
                        <Button onClick={handleLoginClick} size="md">
                            Login
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
};
