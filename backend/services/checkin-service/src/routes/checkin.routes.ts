import { Router } from 'express';
import { 
  scanTicket, 
  getEventSummary, 
  getRecentScans,
  requestAssignment,
  getPendingRequests,
  getEventStaffs,
  approveRequest,
  rejectRequest
} from '../controllers/checkin.controller';
import { requireStaffRole, verifyToken } from '../middleware/auth.middleware';

const router = Router();

// --- TICKET SCANNING ---
// POST /api/checkin/scan - scan QR ticket (staff/admin)
router.post('/scan', verifyToken, requireStaffRole, scanTicket);

// GET /api/checkin/event/:eventId/summary - event stats
router.get('/event/:eventId/summary', getEventSummary);

// GET /api/checkin/event/:eventId/recent - recent scan logs
router.get('/event/:eventId/recent', getRecentScans);

// --- STAFF ASSIGNMENT ---
// Staff gửi yêu cầu
router.post('/staff/request-assignment', verifyToken, requireStaffRole, requestAssignment);

// Organizer xem danh sách yêu cầu
router.get('/organizer/pending-requests', verifyToken, getPendingRequests); // requireOrganizerRole nếu cần

// Organizer xem danh sách nhân viên đã được phân quyền sự kiện
router.get('/organizer/event/:eventId/staff', verifyToken, getEventStaffs);

// Organizer phê duyệt/từ chối
router.post('/organizer/approve-request/:requestId', verifyToken, approveRequest);
router.post('/organizer/reject-request/:requestId', verifyToken, rejectRequest);

export default router;

