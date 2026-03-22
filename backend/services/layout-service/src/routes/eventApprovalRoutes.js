import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import {
    getPendingEvents,
    approveEvent,
    rejectEvent,
    getEventForReview,
    processEventPayout
} from '../controllers/eventApprovalController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage for payout receipts to Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'payout-receipts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        // transformation: [{ width: 1000, crop: 'limit' }]
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

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

// Process event payout (Admin only)
router.patch('/:eventId/payout', requireAuth, requireAdmin, upload.single('receipt'), processEventPayout);

export default router;
