import cron from 'node-cron';
import Event from '../models/Event.js';

export const startEventCleanupJob = () => {
    // Chạy job mỗi phút (Cú pháp cron: '* * * * *')
    // Nếu bạn muốn test chạy mỗi phút một lần thì dùng: '* * * * *'
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            
            // Tìm các sự kiện đã public nhưng endTime đã qua
            const query = {
                endTime: { $lt: now, $ne: null }, // Có endTime và endTime < hiện tại
                status: 'published'
            };

            const result = await Event.updateMany(query, {
                $set: { status: 'completed' }
            });

            if (result.modifiedCount > 0) {
                console.log(`🕒 [CRON JOB] Đã tự động chuyển ${result.modifiedCount} sự kiện sang trạng thái 'completed'.`);
            }
        } catch (error) {
            console.error('❌ [CRON JOB] Lỗi khi quét cập nhật trạng thái sự kiện:', error.message);
        }
    });
};