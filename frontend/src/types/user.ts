// User types
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'customer' | 'organizer' | 'admin';
    status: 'active' | 'inactive' | 'banned';
    createdAt: string;
}

export interface Ticket {
    id: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    ticketType: string;
    seat?: string;
    qrCode: string;
    status: 'valid' | 'used' | 'expired';
}

export interface Order {
    id: string;
    eventId: string;
    eventTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    tickets: {
        type: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: string;
}
