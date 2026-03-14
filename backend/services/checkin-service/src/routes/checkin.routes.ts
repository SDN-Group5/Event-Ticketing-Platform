import { Router } from 'express';
import { scanTicket, getEventSummary, getRecentScans } from '../controllers/checkin.controller';

const router = Router();

// POST /api/checkin/scan - scan QR ticket (public, không auth)
router.post('/scan', scanTicket);

// GET /api/checkin/event/:eventId/summary - event stats (public)
router.get('/event/:eventId/summary', getEventSummary);

// GET /api/checkin/event/:eventId/recent - recent scan logs (public)
router.get('/event/:eventId/recent', getRecentScans);

export default router;

