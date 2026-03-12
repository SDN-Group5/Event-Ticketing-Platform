// Layout API Service - connects to backend Layout Service
// Based on frontend-integration.md

import axios from 'axios';
import { EventLayout, LayoutZone } from '../types/layout';

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface SeatMetadata {
    totalSeats: number;
    availableSeats: number;
    reservedSeats: number;
    soldSeats: number;
    lastUpdated: string;
}

// Get API base URL from Vite env variables or fallback to local gateway
const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

// Setup axios instance
const api = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add auth token interceptor (dùng chung key với AuthContext)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Log request details
    console.log('🌐 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        headers: config.headers
    });

    return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Log successful response
        console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        // Log error details
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export const LayoutAPI = {
    // --- Layout Operations ---

    /** Get all layouts */
    getAllLayouts: async (): Promise<EventLayout[]> => {
        const { data } = await api.get<ApiResponse<EventLayout[]>>('/layouts');
        return data.data!;
    },

    /** Get my layouts (createdBy current user) */
    getMyLayouts: async (): Promise<EventLayout[]> => {
        const { data } = await api.get<ApiResponse<EventLayout[]>>('/layouts/mine');
        return data.data!;
    },

    /** Get layout by Event ID */
    getLayout: async (eventId: string): Promise<EventLayout> => {
        const { data } = await api.get<ApiResponse<EventLayout>>(`/layouts/event/${eventId}`);
        return data.data!;
    },

    /** Create new layout (Auto-generates seats) */
    createLayout: async (layoutData: Partial<EventLayout>): Promise<EventLayout> => {
        const { data } = await api.post<ApiResponse<EventLayout>>('/layouts', layoutData);
        return data.data!;
    },

    /** Update existing layout (Regenerates seats if zones change) */
    updateLayout: async (eventId: string, layoutData: Partial<EventLayout>): Promise<EventLayout> => {
        const { data } = await api.put<ApiResponse<EventLayout>>(`/layouts/event/${eventId}`, layoutData);
        return data.data!;
    },

    /** Delete layout */
    deleteLayout: async (eventId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/layouts/event/${eventId}`);
    },

    /** Validate layout before saving */
    validateLayout: async (layoutData: Partial<EventLayout>): Promise<{ valid: boolean; errors?: any[]; warnings?: any[] }> => {
        const { data } = await api.post<ApiResponse<any>>('/layouts/validate', layoutData);
        return data;
    },

    // --- Test/Debug Methods ---

    /** Test API connection */
    testConnection: async (): Promise<boolean> => {
        try {
            await api.get('/layouts');
            return true;
        } catch (error) {
            return false;
        }
    },
};
