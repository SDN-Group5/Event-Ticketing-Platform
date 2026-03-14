import { Router } from 'express';
import { verifyToken, requireStaffRole } from '../middleware/auth.middleware';
import { scanTicket, getEventSummary, getRecentScans } from '../controllers/checkin.controller';

const router = Router();

// POST /api/checkin/scan - staff scan QR ticket
router.post('/scan', verifyToken, requireStaffRole, scanTicket);

// GET /api/checkin/event/:eventId/summary - event stats for staff dashboard
router.get('/event/:eventId/summary', verifyToken, requireStaffRole, getEventSummary);

// GET /api/checkin/event/:eventId/recent - recent scan logs for event
router.get('/event/:eventId/recent', verifyToken, requireStaffRole, getRecentScans);

export default router;

