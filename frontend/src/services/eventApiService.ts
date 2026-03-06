import axios from 'axios';

// Gọi qua API Gateway (port 4000) thay vì trực tiếp events-service
const EVENT_API_URL = 'http://localhost:4005/api/events'; 

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
        return response.data;
    },

    // 2. [GET] Lấy danh sách sự kiện (Public)
    // Có thể truyền params để lọc (Ví dụ: params = { category: 'music', status: 'published' })
    getAllEvents: async (params?: any) => {
        const response = await axios.get(EVENT_API_URL, { params });
        return response.data;
    },

    // 3. [GET] Lấy chi tiết một sự kiện theo ID (Public)
    getEventById: async (eventId: string) => {
        const response = await axios.get(`${EVENT_API_URL}/${eventId}`);
        return response.data;
    },

    // 4. [PUT] Cập nhật thông tin sự kiện (Protected - Cần token Organizer/Admin)
    updateEvent: async (eventId: string, updateData: any) => {
        const response = await axios.put(`${EVENT_API_URL}/${eventId}`, updateData, getAuthHeaders());
        return response.data;
    },

    // 5. [DELETE] Xóa sự kiện (Protected - Cần token Organizer/Admin)
    deleteEvent: async (eventId: string) => {
        const response = await axios.delete(`${EVENT_API_URL}/${eventId}`, getAuthHeaders());
        return response.data;
    }
};