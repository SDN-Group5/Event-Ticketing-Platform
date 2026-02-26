// Event types
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
