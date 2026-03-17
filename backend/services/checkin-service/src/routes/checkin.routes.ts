import { Router } from 'express';
import { scanTicket, getEventSummary, getRecentScans } from '../controllers/checkin.controller';
import { requireStaffRole, verifyToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/checkin/scan - scan QR ticket (staff/admin)
router.post('/scan', verifyToken, requireStaffRole, scanTicket);

// GET /api/checkin/event/:eventId/summary - event stats (public)
router.get('/event/:eventId/summary', getEventSummary);

// GET /api/checkin/event/:eventId/recent - recent scan logs (public)
router.get('/event/:eventId/recent', getRecentScans);

export default router;

