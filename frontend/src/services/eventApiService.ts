import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_EVENT_URL || 'http://localhost:4002';
const EVENT_API_URL = `${API_BASE}/api/events`; 

// Hàm helper để tự động lấy token từ localStorage gán vào header
const getAuthHeaders = () => {
    // Đồng bộ với AuthContext (`auth_token`)
    const token = localStorage.getItem('auth_token');
    return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { headers: {} };
};

export const EventAPI = {
    // 1. [POST] Tạo sự kiện mới (Protected - Cần token Organizer/Admin)
    createEvent: async (eventData: any) => {
        const response = await axios.post(EVENT_API_URL, eventData, getAuthHeaders());
        return response.data.data;
    },

    // 2. [GET] Lấy danh sách sự kiện (Public)
    // Có thể truyền params để lọc (Ví dụ: params = { category: 'music', status: 'published' })
    getAllEvents: async (params?: any) => {
        const response = await axios.get(EVENT_API_URL, { params });
        return response.data.data || [];
    },

    // 3. [GET] Lấy chi tiết một sự kiện theo ID (Public)
    getEventById: async (eventId: string) => {
        const response = await axios.get(`${EVENT_API_URL}/${eventId}`);
        return response.data.data;
    },

    // 4. [PUT] Cập nhật thông tin sự kiện (Protected - Cần token Organizer/Admin)
    updateEvent: async (eventId: string, updateData: any) => {
        const response = await axios.put(`${EVENT_API_URL}/${eventId}`, updateData, getAuthHeaders());
        return response.data.data;
    },

    // 5. [DELETE] Xóa sự kiện (Protected - Cần token Organizer/Admin)
    deleteEvent: async (eventId: string) => {
        const response = await axios.delete(`${EVENT_API_URL}/${eventId}`, getAuthHeaders());
        return response.data.data;
    },

    // ============================================
    // Venue Management & Suggestions
    // ============================================

    // 6. [GET] Lấy danh sách venues gợi ý (Public)
    getSuggestedVenues: async (limit: number = 5) => {
        const response = await axios.get(`${EVENT_API_URL}/venues/suggested`, {
            params: { limit }
        });
        return response.data.data || [];
    },

    // 7. [POST] Kiểm tra khả dụng của venue (Public)
    checkVenueAvailability: async (location: string, startTime: string, endTime: string) => {
        const response = await axios.post(`${EVENT_API_URL}/venues/check-availability`, {
            location,
            startTime,
            endTime
        });
        return response.data.data;
    }
};