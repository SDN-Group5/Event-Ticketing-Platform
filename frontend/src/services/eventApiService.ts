import axios from 'axios';

// Gọi qua API Gateway (port 4000) thay vì trực tiếp events-service
const EVENT_API_URL = 'http://localhost:4000/api/events'; 

export const EventAPI = {
    createEvent: async (eventData: any) => {
        // Lấy token từ localStorage (hoặc state management của bạn)
        const token = localStorage.getItem('token'); 
        
        const response = await axios.post(EVENT_API_URL, eventData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },
    // Bạn có thể thêm các hàm getAll, getById sau...
};