import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchInput } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

interface NavbarProps {
    showSearch?: boolean;
    onLoginClick?: () => void;
    user?: {
        name: string;
        avatar?: string;
    };
}

export const Navbar: React.FC<NavbarProps> = ({
    showSearch = true,
    onLoginClick,
    user: userProp,
}) => {
    const { user: authUser, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const user = userProp ?? (authUser ? { name: authUser.name, avatar: authUser.avatar ?? undefined } : null);
    const isCustomer = authUser?.role === 'customer';

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const handleLogin = () => {
        if (onLoginClick) onLoginClick();
        else navigate(ROUTES.LOGIN);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[#2d2839] bg-[#151022]/80 backdrop-blur-md px-4 md:px-10 py-3">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to={ROUTES.HOME} className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-[#8655f6] to-[#d946ef] text-white shadow-[0_0_15px_rgba(137,90,246,0.5)]">
                        <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                    </div>
                    <h2 className="hidden md:block text-white text-xl font-bold tracking-tight">TicketVibe</h2>
                </Link>

                {/* Search */}
                {showSearch && (
                    <div className="hidden md:flex flex-1 max-w-lg mx-4">
                        <SearchInput placeholder="Search events, artists, or venues..." />
                    </div>
                )}

                {/* Khi đăng nhập (customer): Vé | Sự kiện | Lịch sử thanh toán */}
                {isCustomer && (
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            to={ROUTES.MY_TICKETS}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2a2436] transition-colors"
                        >
                            Vé
                        </Link>
                        <Link
                            to={ROUTES.SEARCH}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2a2436] transition-colors"
                        >
                            Sự kiện
                        </Link>
                        <Link
                            to={ROUTES.TRANSACTION_HISTORY}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2a2436] transition-colors"
                        >
                            Lịch sử thanh toán
                        </Link>
                    </nav>
                )}

                {/* Auth: nút Login hoặc avatar + dropdown (Profile, Đăng xuất) */}
                <div className="flex items-center gap-3">
                    {(user || isAuthenticated) ? (
                        <div className="relative flex items-center gap-2" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((o) => !o)}
                                className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-[#8655f6]/30 cursor-pointer focus:outline-none flex-shrink-0"
                                style={{ backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined }}
                            >
                                {!user?.avatar && (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center text-white font-bold">
                                        {(user?.name || authUser?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52 py-2 bg-[#2a2436] border border-[#3a3447] rounded-xl shadow-xl z-50">
                                    <Link
                                        to={ROUTES.PROFILE}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#342640] hover:text-white"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span className="material-symbols-outlined text-lg">person</span>
                                        Hồ sơ
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => { setMenuOpen(false); logout(); navigate(ROUTES.HOME); }}
                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-[#342640] text-left"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Button onClick={handleLogin} size="md">
                            Login
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
};
