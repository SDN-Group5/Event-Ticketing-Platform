import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarItem {
    name: string;
    icon: string;
    path: string;
    badge?: string | number;
}

interface SidebarProps {
    items: SidebarItem[];
    activePath: string;
    onNavigate: (path: string) => void;
    title?: string;
    subtitle?: string;
    logo?: React.ReactNode;
    variant?: 'default' | 'admin' | 'organizer';
}

export const Sidebar: React.FC<SidebarProps> = ({
    items,
    activePath,
    onNavigate,
    title = 'TicketVibe',
    subtitle,
    logo,
    variant = 'default',
}) => {
    const navigate = useNavigate();

    // Initialize collapsed state from localStorage to persist across navigations
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });

    // Save preference when changed
    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(isCollapsed));
    }, [isCollapsed]);

    const variantClasses = {
        default: 'bg-[#0f0f12] border-[#2d2839]',
        admin: 'bg-[#0f1219] border-slate-800',
        organizer: 'bg-[#151022] border-[#342f42]',
    };

    const activeClasses = {
        default: 'bg-[#8655f6]/10 text-[#8655f6]',
        admin: 'bg-[#d946ef]/10 text-[#d946ef]',
        organizer: 'bg-[#895af6]/10 text-[#895af6]',
    };

    return (
        <aside
            className={`
                flex flex-col sticky top-0 hidden lg:flex transition-all duration-300 ease-in-out relative border-r
                ${variantClasses[variant]}
                ${isCollapsed ? 'w-20' : 'w-64'}
                h-screen
            `}
        >


            {/* Header */}
            <div className={`flex items-center gap-3 transition-all ${isCollapsed ? 'p-4 justify-center' : 'p-6'}`}>
                <div onClick={() => setIsCollapsed(!isCollapsed)} className="cursor-pointer hover:opacity-80 transition-opacity">
                    {logo || (
                        <div className="w-8 h-8 bg-[#8655f6] rounded-lg flex items-center justify-center text-white shrink-0">
                            <span className="material-symbols-outlined text-lg">confirmation_number</span>
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <h1 className="text-white font-bold text-lg leading-tight">{title}</h1>
                        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2 mt-2 overflow-y-auto overflow-x-hidden">
                {items.map((item) => {
                    const isActive = activePath === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => {
                                onNavigate(item.path);
                                navigate(item.path);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group relative
                                ${isActive ? activeClasses[variant] : 'text-gray-500 hover:text-white hover:bg-white/5'}
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                        >
                            <span className={`material-symbols-outlined shrink-0 ${isActive ? 'filled' : ''} ${isCollapsed ? 'text-2xl' : ''}`}>
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <>
                                    <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
                                    {item.badge && (
                                        <span className="text-xs bg-[#8655f6]/20 text-[#8655f6] px-2 py-0.5 rounded-full shrink-0">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}

                            {/* Tooltip for collapsed mode */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                                    {item.name}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};
