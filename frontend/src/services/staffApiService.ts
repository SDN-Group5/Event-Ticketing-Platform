import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
const STAFF_API_URL = `${API_BASE}/api/users/staff`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { headers: {} };
};

export const StaffAPI = {
    // 1. [POST] Create new staff (Organizer only)
    createStaff: async (staffData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }) => {
        const response = await axios.post(STAFF_API_URL, staffData, getAuthHeaders());
        return response.data;
    },

    // 2. [GET] Get all staff (Organizer only)
    getStaffList: async (params?: {
        page?: number;
        limit?: number;
        isActive?: boolean;
    }) => {
        const response = await axios.get(STAFF_API_URL, {
            ...getAuthHeaders(),
            params
        });
        return response.data;
    },

    // 3. [GET] Get staff by ID (Organizer only)
    getStaffById: async (staffId: string) => {
        const response = await axios.get(`${STAFF_API_URL}/${staffId}`, getAuthHeaders());
        return response.data;
    },

    // 4. [PATCH] Update staff (Organizer only)
    updateStaff: async (staffId: string, updateData: {
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        isActive?: boolean;
    }) => {
        const response = await axios.patch(
            `${STAFF_API_URL}/${staffId}`,
            updateData,
            getAuthHeaders()
        );
        return response.data;
    },

    // 5. [DELETE] Delete staff (Organizer only)
    deleteStaff: async (staffId: string) => {
        const response = await axios.delete(
            `${STAFF_API_URL}/${staffId}`,
            getAuthHeaders()
        );
        return response.data;
    }
};
