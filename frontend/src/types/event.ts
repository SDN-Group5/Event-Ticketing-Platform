// Event types - khớp với events.json
export interface EventFromJson {
    id: string;
    title: string;
    artist?: string;
    description: string;
    date: string;
    location: string;
    image: string;
    organizerId: string;
    seatMapId: string;
    minPrice: number;
    maxPrice: number;
    priceDisplay?: string;
    status: 'published' | 'draft';
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    imageUrl: string;
    category: string;
    price: {
        min: number;
        max: number;
    };
    status: 'upcoming' | 'live' | 'sold_out' | 'cancelled';
    organizer: {
        id: string;
        name: string;
        verified: boolean;
    };
}

export interface TicketType {
    id: string;
    name: string;
    price: number;
    available: number;
    total: number;
    description?: string;
}

export interface Zone {
    id: string;
    name: string;
    type: 'vip' | 'standard' | 'general';
    capacity: number;
    price: number;
    color: string;
}
