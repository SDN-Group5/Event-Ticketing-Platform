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

export default router;
