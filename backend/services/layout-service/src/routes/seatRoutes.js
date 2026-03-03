import express from 'express';
import seatService from '../services/seatService.js';
import Seat from '../models/Seat.js';

const router = express.Router();

// Middleware placeholder - replace with actual auth middleware when available
const authenticate = (req, res, next) => {
    // TODO: Replace with actual authentication logic
    // For now, simulate authenticated user
    req.user = { _id: '65c4d6f8e7b1a2b3c4d5e6f8' }; // Mock user ID
    next();
};

/**
 * GET /api/v1/events/:eventId/seats
 * Query params: zoneId, status, page, limit
 */
router.get('/events/:eventId/seats', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { zoneId, status, page, limit } = req.query;

        if (!zoneId) {
            return res.status(400).json({ error: 'zoneId is required' });
        }

        const result = await seatService.getSeatsByZone(eventId, zoneId, {
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 100
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/v1/events/:eventId/seats/:seatId
 */
router.get('/events/:eventId/seats/:seatId', async (req, res) => {
    try {
        const { seatId } = req.params;
        const seat = await Seat.findById(seatId);

        if (!seat) {
            return res.status(404).json({ error: 'Seat not found' });
        }

        res.json(seat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/v1/events/:eventId/seats/reserve
 * Body: { row, seatNumber, zoneId }
 */
router.post('/events/:eventId/seats/reserve', authenticate, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { zoneId, row, seatNumber } = req.body;
        const userId = req.user._id;

        if (!zoneId || !row || !seatNumber) {
            return res.status(400).json({
                error: 'zoneId, row, and seatNumber are required'
            });
        }

        const seat = await seatService.reserveSeat(
            eventId,
            zoneId,
            row,
            seatNumber,
            userId
        );

        res.json(seat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/v1/events/:eventId/seats/:seatId/purchase
 * Body: { bookingId }
 */
router.post('/events/:eventId/seats/:seatId/purchase', authenticate, async (req, res) => {
    try {
        const { seatId } = req.params;
        const { bookingId } = req.body;
        const userId = req.user._id;

        if (!bookingId) {
            return res.status(400).json({ error: 'bookingId is required' });
        }

        const seat = await seatService.confirmPurchase(seatId, userId, bookingId);

        res.json(seat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * DELETE /api/v1/events/:eventId/seats/:seatId/reservation
 */
router.delete('/events/:eventId/seats/:seatId/reservation', authenticate, async (req, res) => {
    try {
        const { seatId } = req.params;
        const userId = req.user._id;

        const seat = await seatService.releaseReservation(seatId, userId);

        res.json(seat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/v1/events/:eventId/seats/bulk-sold
 * Body: { seatIds: string[], userId, bookingId }
 * Marks seats as sold by zoneId. seatId format: "zoneId-row-seatNum" (last two segments are row and seatNumber)
 */
router.post('/events/:eventId/seats/bulk-sold', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { seatIds, userId, bookingId } = req.body;

        if (!seatIds || !seatIds.length) {
            return res.status(400).json({ error: 'seatIds is required' });
        }

        // Parse zoneId, row, seatNumber from seatId string like "zone-1772464570867-3miaaphot-3-4"
        // Last two segments are row and seatNumber; everything before is zoneId
        const updates = [];
        for (const rawSeatId of seatIds) {
            const parts = rawSeatId.split('-');
            if (parts.length < 4) continue;
            const seatNumber = parseInt(parts[parts.length - 1]);
            const row = parseInt(parts[parts.length - 2]);
            const zoneId = parts.slice(0, parts.length - 2).join('-');
            updates.push({ zoneId, row, seatNumber });
        }

        const mongoose = (await import('mongoose')).default;
        const objectIdEventId = new mongoose.Types.ObjectId(eventId);
        const results = [];

        for (const { zoneId, row, seatNumber } of updates) {
            const seat = await Seat.findOneAndUpdate(
                { eventId: objectIdEventId, zoneId, row, seatNumber, status: { $ne: 'sold' } },
                {
                    $set: {
                        status: 'sold',
                        soldBy: userId || null,
                        soldAt: new Date(),
                        ...(mongoose.Types.ObjectId.isValid(bookingId) ? { bookingId } : {}),
                        reservationExpiry: null,
                    },
                    $inc: { version: 1 }
                },
                { new: true }
            );
            if (seat) {
                results.push(seat);
                // Update zone cache
                try { await seatService.updateZoneCache(seat.layoutId, zoneId); } catch (_) { }
            }
        }

        res.json({ success: true, updated: results.length, seats: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
