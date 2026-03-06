import axios from 'axios';

// Thay đổi URL này thành URL của API Gateway nếu bạn đã setup, 
// hoặc gọi trực tiếp cổng 3003 của event-service
const EVENT_API_URL = 'http://localhost:3003/api/events'; 

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