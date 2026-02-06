import React, { useState } from 'react';

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

// Event Card specific component - props từ events.json
interface EventCardProps {
    title: string;
    artist?: string;
    imageUrl: string;
    date: string;
    month: string;
    location?: string;
    price?: string;
    onBuyClick?: () => void;
    onWishlistClick?: () => void;
}

const FALLBACK_IMAGE = 'https://placehold.co/600x450/1e293b/8655f6?text=Event';

export const EventCard: React.FC<EventCardProps> = ({
    title,
    artist,
    imageUrl,
    date,
    month,
    location,
    price = '500k VND',
    onBuyClick,
    onWishlistClick,
}) => {
    const [imgSrc, setImgSrc] = useState(imageUrl);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const handleImageError = () => {
        if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
    };
    const handleHeartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
        onWishlistClick?.();
    };

    return (
        <Card className="group flex flex-col h-full">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#1e293b]">
                <img
                    src={imgSrc}
                    alt={title}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 bg-[#8655f6] rounded-lg px-3 py-1.5 text-center">
                    <p className="text-xs font-bold text-white uppercase leading-tight">{month}</p>
                    <p className="text-lg font-bold text-white leading-none">{date}</p>
                </div>
                <button
                    onClick={handleHeartClick}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                    aria-label="Add to wishlist"
                >
                    <span className={`material-symbols-outlined text-white ${isWishlisted ? 'filled text-red-400' : ''}`}>
                        favorite
                    </span>
                </button>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-0.5">{title}</h3>
                {artist && <p className="text-sm text-gray-400 mb-2">{artist}</p>}
                {location && (
                    <p className="text-sm text-gray-400 mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base shrink-0">location_on</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>
                )}
                <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center gap-3">
                    <span className="text-sm font-medium text-gray-300">{price}</span>
                    <button
                        onClick={onBuyClick}
                        className="px-4 py-2 rounded-lg border-2 border-[#8655f6] text-[#8655f6] font-bold hover:bg-[#8655f6] hover:text-white transition-all text-sm shrink-0"
                    >
                        Buy Ticket
                    </button>
                </div>
            </div>
        </Card>
    );
};
