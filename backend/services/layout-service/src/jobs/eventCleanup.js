import EventLayout from '../models/EventLayout.js';

/**
 * Job to scan and complete events that have passed their end time.
 * Runs periodically to ensure events transition to 'completed' status automatically.
 */
export const startEventCleanupJob = () => {
    // Run every 15 minutes
    const INTERVAL = 5 * 60 * 1000;

    console.log('🕒 Event Cleanup Job started (Interval: 15m)');

    setInterval(async () => {
        try {
            const now = new Date();

            // Find events that:
            // 1. Are published (active)
            // 2. Have an eventEndDate that is in the past
            // 3. Are not already completed
            const result = await EventLayout.updateMany(
                {
                    status: 'published',
                    eventEndDate: { $lt: now },
                    $or: [
                        { status: { $ne: 'completed' } }
                    ]
                },
                {
                    $set: { status: 'completed' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ [EventCleanup] Automatically completed ${result.modifiedCount} events.`);
            }

            // Fallback for events without eventEndDate: use eventDate + 24h
            const fallbackNow = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const fallbackResult = await EventLayout.updateMany(
                {
                    status: 'published',
                    eventEndDate: { $exists: false },
                    eventDate: { $lt: fallbackNow }
                },
                {
                    $set: { status: 'completed' }
                }
            );

            if (fallbackResult.modifiedCount > 0) {
                console.log(`✅ [EventCleanup] Automatically completed ${fallbackResult.modifiedCount} events (Fallback: start + 24h).`);
            }

        } catch (error) {
            console.error('❌ [EventCleanup] Error running cleanup job:', error);
        }
    }, INTERVAL);
};
