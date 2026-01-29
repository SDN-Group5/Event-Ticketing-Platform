import React from 'react';

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
        <aside className={`w-64 border-r ${variantClasses[variant]} flex flex-col h-screen sticky top-0 hidden lg:flex`}>
            {/* Header */}
            <div className="p-6 flex items-center gap-3">
                {logo || (
                    <div className="w-8 h-8 bg-[#8655f6] rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-lg">confirmation_number</span>
                    </div>
                )}
                <div>
                    <h1 className="text-white font-bold text-lg">{title}</h1>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {items.map((item) => {
                    const isActive = activePath === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => onNavigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${isActive
                                    ? activeClasses[variant]
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium flex-1">{item.name}</span>
                            {item.badge && (
                                <span className="text-xs bg-[#8655f6]/20 text-[#8655f6] px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};
