import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        role: string;
        avatar?: string;
    };
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Đóng menu khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'organizer':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'staff':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* User Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center text-white font-bold text-sm border-2 border-[#8655f6]/30">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        user.name.charAt(0).toUpperCase()
                    )}
                </div>

                {/* User Info (hidden on mobile) */}
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                    </span>
                </div>

                {/* Dropdown Icon */}
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <button
                            onClick={() => {
                                navigate('/profile');
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined text-lg">person</span>
                            <span>Hồ sơ</span>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/settings');
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined text-lg">settings</span>
                            <span>Cài đặt</span>
                        </button>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-white/10 p-2">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-3 rounded-lg"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
