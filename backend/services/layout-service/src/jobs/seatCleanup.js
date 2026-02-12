import cron from 'node-cron';
import seatService from '../services/seatService.js';

/**
 * Chạy mỗi phút để release expired reservations
 */
export function startSeatCleanupJob() {
    cron.schedule('* * * * *', async () => {
        try {
            const released = await seatService.releaseExpiredReservations();
            if (released.length > 0) {
                console.log(`[Seat Cleanup] Released ${released.length} expired reservations`);
            }
        } catch (error) {
            console.error('[Seat Cleanup] Error:', error);
        }
    });

    console.log('[Seat Cleanup] Job started - runs every minute');
}
