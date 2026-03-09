import cron from 'node-cron';
import Event from '../models/Event.js';

export const startEventCleanupJob = () => {
    // Chạy job mỗi 15 phút (Cú pháp cron: '*/15 * * * *')
    // Nếu bạn muốn test chạy mỗi phút một lần thì dùng: '* * * * *'
    cron.schedule('*/15 * * * *', async () => {
        try {
            const now = new Date();
            
            // Tìm các sự kiện đã public/approved nhưng endTime đã qua
            const query = {
                endTime: { $lt: now, $ne: null }, // Có endTime và endTime < hiện tại
                status: { $in: ['published', 'approved'] }
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