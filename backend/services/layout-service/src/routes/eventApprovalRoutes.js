import express from 'express';
import {
    getPendingEvents,
    approveEvent,
    rejectEvent,
    getEventForReview
} from '../controllers/eventApprovalController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Only admin can access these routes
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ Admin mới có quyền thực hiện hành động này'
        });
    }
    next();
};

// Get list of pending events for admin
router.get('/admin/pending', requireAuth, requireAdmin, getPendingEvents);

// Approve event
router.patch('/:eventId/approve', requireAuth, requireAdmin, approveEvent);

// Reject event
router.patch('/:eventId/reject', requireAuth, requireAdmin, rejectEvent);

// Get event for review
router.get('/:eventId/review', requireAuth, requireAdmin, getEventForReview);

export default router;
