// Seat API Service - connects to backend Layout Service for seat management
// Based on backend seat routes

import axios from 'axios';

// API Response types
export interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface SeatData {
    _id: string;
    eventId: string;
    layoutId: string;
    zoneId: string;
    row: number;
    seatNumber: number;
    seatLabel: string;
    status: 'available' | 'reserved' | 'sold' | 'blocked';
    reservedBy?: string;
    reservedAt?: string;
    reservationExpiry?: string;
    soldBy?: string;
    soldAt?: string;
    bookingId?: string;
    price: number;
    discount?: number;
    isAccessible?: boolean;
    notes?: string;
    version: number;
    createdAt: string;
    updatedAt: string;
}

export interface SeatsResponse {
    seats: SeatData[];
    total: number;
    page: number;
    limit: number;
}

// Setup axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    console.log('🪑 Seat API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
    });

    return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log('✅ Seat API Response:', {
            url: response.config.url,
            status: response.status,
            dataCount: Array.isArray(response.data?.seats) ? response.data.seats.length : 'N/A',
        });
        return response;
    },
    (error) => {
        console.error('❌ Seat API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.error || error.message,
        });
        return Promise.reject(error);
    }
);

export const SeatAPI = {
    /**
     * Get all seats for a specific zone in an event
     * @param eventId - Event ID
     * @param zoneId - Zone ID
     * @param options - Query options (status, page, limit)
     */
    getSeatsByZone: async (
        eventId: string,
        zoneId: string,
        options?: {
            status?: 'available' | 'reserved' | 'sold' | 'blocked';
            page?: number;
            limit?: number;
        }
    ): Promise<SeatsResponse> => {
        const { data } = await api.get<SeatsResponse>(`/events/${eventId}/seats`, {
            params: {
                zoneId,
                ...options,
            },
        });
        return data;
    },

    /**
     * Get all seats for an event (across all zones)
     * Note: This makes multiple API calls, one per zone
     */
    getAllSeatsForEvent: async (eventId: string, zoneIds: string[]): Promise<SeatData[]> => {
        try {
            const promises = zoneIds.map((zoneId) =>
                SeatAPI.getSeatsByZone(eventId, zoneId, { limit: 1000 })
            );
            const results = await Promise.all(promises);
            return results.flatMap((result) => result.seats);
        } catch (error) {
            console.error('Error fetching all seats for event:', error);
            return [];
        }
    },

    /**
     * Get a specific seat by ID
     */
    getSeatById: async (eventId: string, seatId: string): Promise<SeatData> => {
        const { data } = await api.get<SeatData>(`/events/${eventId}/seats/${seatId}`);
        return data;
    },

    /**
     * Reserve a seat
     */
    reserveSeat: async (
        eventId: string,
        zoneId: string,
        row: number,
        seatNumber: number
    ): Promise<SeatData> => {
        const { data } = await api.post<SeatData>(`/events/${eventId}/seats/reserve`, {
            zoneId,
            row,
            seatNumber,
        });
        return data;
    },

    /**
     * Purchase a seat (confirm reservation)
     */
    purchaseSeat: async (eventId: string, seatId: string, bookingId: string): Promise<SeatData> => {
        const { data } = await api.post<SeatData>(`/events/${eventId}/seats/${seatId}/purchase`, {
            bookingId,
        });
        return data;
    },

    /**
     * Release a seat reservation
     */
    releaseReservation: async (eventId: string, seatId: string): Promise<SeatData> => {
        const { data } = await api.delete<SeatData>(`/events/${eventId}/seats/${seatId}/reservation`);
        return data;
    },

    /**
     * Get booked seat IDs for 3D viewer (seats that are reserved or sold)
     */
    getBookedSeatIds: async (eventId: string, zoneIds: string[]): Promise<string[]> => {
        try {
            const allSeats = await SeatAPI.getAllSeatsForEvent(eventId, zoneIds);
            return allSeats
                .filter((seat) => seat.status === 'reserved' || seat.status === 'sold')
                .map((seat) => `${seat.zoneId}-R${seat.row}-S${seat.seatNumber}`);
        } catch (error) {
            console.error('Error getting booked seat IDs:', error);
            return [];
        }
    },
};
