import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
    size?: 'sm' | 'md';
    dot?: boolean;
    dotColor?: string;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'sm',
    dot,
    dotColor,
    className = '',
}) => {
    const baseClasses = 'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full';

    const variantClasses = {
        primary: 'bg-[#8655f6]/10 text-[#8655f6] border border-[#8655f6]/20',
        success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
        error: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
        neutral: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    };

    const sizeClasses = {
        sm: 'py-1 px-2.5 text-[10px]',
        md: 'py-1.5 px-3 text-xs',
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {dot && (
                <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: dotColor || 'currentColor' }}
                />
            )}
            {children}
        </span>
    );
};

// Status Badge for tables
interface StatusBadgeProps {
    status: 'active' | 'pending' | 'banned' | 'draft' | 'live' | 'sold_out';
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const statusConfig = {
        active: { label: 'Active', variant: 'success' as const },
        pending: { label: 'Pending', variant: 'warning' as const },
        banned: { label: 'Banned', variant: 'error' as const },
        draft: { label: 'Draft', variant: 'neutral' as const },
        live: { label: 'Live & Selling', variant: 'success' as const },
        sold_out: { label: 'Sold Out', variant: 'error' as const },
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} dot className={className}>
            {config.label}
        </Badge>
    );
};
