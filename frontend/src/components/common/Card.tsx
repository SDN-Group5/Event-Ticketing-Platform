import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'solid';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    hover = true,
    padding = 'none',
}) => {
    const baseClasses = 'rounded-2xl overflow-hidden transition-all';

    const variantClasses = {
        default: 'bg-white/5 border border-white/5',
        glass: 'bg-[#1e293b]/60 backdrop-blur-xl border border-white/10',
        solid: 'bg-[#1e1e24] border border-[#2d2839]',
    };

    const hoverClasses = hover
        ? 'hover:border-[#8655f6]/30 hover:shadow-[0_10px_30px_-10px_rgba(137,90,246,0.2)]'
        : '';

    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
};

// Event Card specific component
interface EventCardProps {
    title: string;
    imageUrl: string;
    date: string;
    month: string;
    price?: string;
    onBuyClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
    title,
    imageUrl,
    date,
    month,
    price = 'From $50',
    onBuyClick,
}) => {
    return (
        <Card className="group flex flex-col h-full">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 text-center min-w-[60px]">
                    <p className="text-xs font-bold text-[#8655f6] uppercase">{month}</p>
                    <p className="text-xl font-bold text-white leading-none">{date}</p>
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-sm text-gray-400">{price}</span>
                    <button
                        onClick={onBuyClick}
                        className="px-4 py-2 rounded-lg border border-[#8655f6] text-[#8655f6] font-bold hover:bg-[#8655f6] hover:text-white transition-all text-sm"
                    >
                        Buy Ticket
                    </button>
                </div>
            </div>
        </Card>
    );
};
