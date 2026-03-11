import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
const EVENTS_API_URL = `${API_BASE}/api/events`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { headers: {} };
};

export const EventApprovalAPI = {
    // 1. [GET] Get pending events for admin review
    getPendingEvents: async (params?: {
        page?: number;
        limit?: number;
        organizerId?: string;
        search?: string;
    }) => {
        const response = await axios.get(
            `${EVENTS_API_URL}/admin/pending`,
            {
                ...getAuthHeaders(),
                params
            }
        );
        return response.data;
    },

    // 2. [PATCH] Approve an event (set status to published)
    approveEvent: async (eventId: string) => {
        const response = await axios.patch(
            `${EVENTS_API_URL}/${eventId}/approve`,
            {},
            getAuthHeaders()
        );
        return response.data;
    },

    // 3. [PATCH] Reject an event (set status to rejected)
    rejectEvent: async (eventId: string, rejectionReason: string) => {
        const response = await axios.patch(
            `${EVENTS_API_URL}/${eventId}/reject`,
            { rejectionReason },
            getAuthHeaders()
        );
        return response.data;
    }
};
