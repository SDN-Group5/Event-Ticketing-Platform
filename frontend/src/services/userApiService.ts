import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
const USERS_API_URL = `${API_BASE}/api/users`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
};

export const UserAPI = {
    // 1. [GET] Get all users (Admin only)
    getUsers: async (params?: {
        page?: number;
        limit?: number;
        role?: string;
    }) => {
        const response = await axios.get(USERS_API_URL, {
            ...getAuthHeaders(),
            params
        });
        return response.data;
    },

    // 2. [PATCH] Update any user (Admin only)
    updateUser: async (userId: string, updateData: any) => {
        const response = await axios.patch(`${USERS_API_URL}/${userId}`, updateData, getAuthHeaders());
        return response.data;
    },

    // 3. [GET] Get user by ID (Public/S2S)
    getUserById: async (userId: string) => {
        const response = await axios.get(`${USERS_API_URL}/${userId}`, getAuthHeaders());
        return response.data;
    },

    // 3. [GET] Get current user
    getMe: async () => {
        const response = await axios.get(`${USERS_API_URL}/me`, getAuthHeaders());
        return response.data;
    },

    // 4. [PATCH] Update current user
    updateMe: async (userData: any) => {
        const response = await axios.patch(`${USERS_API_URL}/me`, userData, getAuthHeaders());
        return response.data;
    },

    // 5. [POST] Change password
    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await axios.post(
            `${API_BASE}/api/auth/change-password`,
            { currentPassword, newPassword },
            getAuthHeaders(),
        );
        return response.data;
    },
};
