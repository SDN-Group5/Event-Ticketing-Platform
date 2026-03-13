import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    getPendingEvents,
    approveEvent,
    rejectEvent,
    getEventForReview,
    processEventPayout
} from '../controllers/eventApprovalController.js';

const router = express.Router();

// Config multer for receipt uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/payouts/') // Need to ensure this directory exists or handled by layout service entry point
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Get list of pending events for admin
router.get('/admin/pending', getPendingEvents);

// Approve event
router.patch('/:eventId/approve', approveEvent);

// Reject event
router.patch('/:eventId/reject', rejectEvent);

// Get event for review
router.get('/:eventId/review', getEventForReview);

// Process event payout (Admin only)
router.patch('/:eventId/payout', upload.single('receipt'), processEventPayout);

export default router;
