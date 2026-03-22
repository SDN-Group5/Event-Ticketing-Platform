import { Router } from 'express';
import { 
  scanTicket, 
  getEventSummary, 
  getRecentScans,
  getTicketRecords,
  getTicketStatistics,
  requestAssignment,
  getPendingRequests,
  approveRequest,
  rejectRequest
} from '../controllers/checkin.controller';
import { requireStaffRole, requireOrganizerOrStaff, verifyToken } from '../middleware/auth.middleware';

const router = Router();

// --- TICKET SCANNING ---
// POST /api/checkin/scan - scan QR ticket (staff/admin/organizer)
router.post('/scan', verifyToken, requireOrganizerOrStaff, scanTicket);

// GET /api/checkin/records - danh sách vé (organizer/staff/admin)
router.get('/records', verifyToken, requireOrganizerOrStaff, getTicketRecords);

// GET /api/checkin/statistics/summary - thống kê (organizer/staff/admin)
router.get('/statistics/summary', verifyToken, requireOrganizerOrStaff, getTicketStatistics);

// GET /api/checkin/event/:eventId/summary - event stats
router.get('/event/:eventId/summary', getEventSummary);

// GET /api/checkin/event/:eventId/recent - recent scan logs
router.get('/event/:eventId/recent', getRecentScans);

// --- STAFF ASSIGNMENT ---
// Staff gửi yêu cầu
router.post('/staff/request-assignment', verifyToken, requireStaffRole, requestAssignment);

// Organizer xem danh sách yêu cầu
router.get('/organizer/pending-requests', verifyToken, getPendingRequests); // requireOrganizerRole nếu cần

// Organizer phê duyệt/từ chối
router.post('/organizer/approve-request/:requestId', verifyToken, approveRequest);
router.post('/organizer/reject-request/:requestId', verifyToken, rejectRequest);

export default router;

