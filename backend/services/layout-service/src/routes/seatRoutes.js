import express from 'express';
import seatService from '../services/seatService.js';
import Seat from '../models/Seat.js';
import { requireAuth } from '../middleware/auth.js';
import { broadcastSeatUpdate } from '../socket.js';

const router = express.Router();

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
router.post('/events/:eventId/seats/reserve', requireAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { zoneId, row, seatNumber } = req.body;
        const userId = req.user.id;

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
router.post('/events/:eventId/seats/:seatId/purchase', requireAuth, async (req, res) => {
    try {
        const { seatId } = req.params;
        const { bookingId } = req.body;
        const userId = req.user.id;

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
 * PATCH /api/v1/events/:eventId/seats/:seatId/reservation
 * Soft release reservation: chỉ update status về "available"
 */
router.patch('/events/:eventId/seats/:seatId/reservation', requireAuth, async (req, res) => {
    try {
        const { seatId } = req.params;
        const userId = req.user.id;

        const seat = await seatService.releaseReservation(seatId, userId);

        res.json(seat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Backwards compatibility: giữ DELETE nếu có chỗ nào còn gọi
router.delete('/events/:eventId/seats/:seatId/reservation', requireAuth, async (req, res) => {
    try {
        const { seatId } = req.params;
        const userId = req.user.id;

        const seat = await seatService.releaseReservation(seatId, userId);

        res.json(seat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/v1/events/:eventId/seats/bulk-release
 * Body: { seatIds: string[] }
 * Service-to-service: payment-service gọi khi huỷ thanh toán.
 * seatId format: "zoneId-row-seatNum"
 */
router.post('/events/:eventId/seats/bulk-release', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { seatIds } = req.body;

        if (!seatIds || !seatIds.length) {
            return res.status(400).json({ error: 'seatIds is required' });
        }

        const mongoose = (await import('mongoose')).default;
        const objectIdEventId = new mongoose.Types.ObjectId(eventId);
        const results = [];

        for (const rawSeatId of seatIds) {
            const parts = rawSeatId.split('-');
            if (parts.length < 3) {
                console.log(`[bulk-release] Invalid seatId format: ${rawSeatId}`);
                continue;
            }
            const seatNumber = parseInt(parts.pop());
            const row = parseInt(parts.pop());
            const zoneId = parts.join('-');

            const seat = await Seat.findOneAndUpdate(
                { eventId: objectIdEventId, zoneId, row, seatNumber, status: { $in: ['reserved', 'sold'] } },
                {
                    $set: {
                        status: 'available',
                        reservedBy: null,
                        reservedAt: null,
                        reservationExpiry: null,
                        soldBy: null,
                        soldAt: null,
                        bookingId: null,
                    },
                    $inc: { version: 1 }
                },
                { new: true }
            );
            if (seat) {
                results.push(seat);
                try { await seatService.updateZoneCache(seat.layoutId, zoneId); } catch (_) { }
            }
        }

        if (results.length > 0) {
            broadcastSeatUpdate(eventId, results.map(s => ({
                zoneId: s.zoneId, row: s.row, seatNumber: s.seatNumber,
                status: 'available',
            })));
        }

        res.json({ success: true, released: results.length, seats: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

        if (results.length > 0) {
            broadcastSeatUpdate(eventId, results.map(s => ({
                zoneId: s.zoneId, row: s.row, seatNumber: s.seatNumber,
                status: 'sold',
            })));
        }

        res.json({ success: true, updated: results.length, seats: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router;
