import express from 'express';
import {
    getPendingEvents,
    approveEvent,
    rejectEvent,
    getEventForReview
} from '../controllers/eventApprovalController.js';

const router = express.Router();

// Get list of pending events for admin
router.get('/admin/pending', getPendingEvents);

// Approve event
router.patch('/:eventId/approve', approveEvent);

// Reject event
router.patch('/:eventId/reject', rejectEvent);

// Get event for review
router.get('/:eventId/review', getEventForReview);

export default router;
