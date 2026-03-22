import { Router } from 'express';
import {
  scanTicket,
  getEventSummary,
  getRecentScans,
  getTicketRecords,
  getTicketStatistics,
} from '../controllers/checkin.controller';
import { requireStaffRole, requireOrganizerOrStaff, verifyToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/checkin/scan - scan QR ticket (staff/admin/organizer)
router.post('/scan', verifyToken, requireOrganizerOrStaff, scanTicket);

// GET /api/checkin/records - danh sách vé (organizer/staff/admin)
router.get('/records', verifyToken, requireOrganizerOrStaff, getTicketRecords);

// GET /api/checkin/statistics/summary - thống kê (organizer/staff/admin)
router.get('/statistics/summary', verifyToken, requireOrganizerOrStaff, getTicketStatistics);

// GET /api/checkin/event/:eventId/summary - event stats (public)
router.get('/event/:eventId/summary', getEventSummary);

// GET /api/checkin/event/:eventId/recent - recent scan logs (public)
router.get('/event/:eventId/recent', getRecentScans);

export default router;

