import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {
    getLayoutByEvent,
    createLayout,
    updateLayout,
    deleteLayout,
    validateLayout,
    getAllLayouts,
    getCompletedLayouts,
    getMyLayouts
} from '../controllers/layoutController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage for event banner uploads to Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'event-banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }]
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});

// Public routes
router.get('/', getAllLayouts); // GET /api/v1/layouts
router.get('/completed-events', getCompletedLayouts); // GET /api/v1/layouts/completed-events
router.get('/mine', requireAuth, getMyLayouts); // GET /api/v1/layouts/mine
router.get('/event/:eventId', getLayoutByEvent);

// Protected routes (Organizer/Admin) - cần token để lấy createdBy
router.post('/', requireAuth, createLayout);
router.put('/event/:eventId', requireAuth, updateLayout);
router.delete('/event/:eventId', requireAuth, deleteLayout);
router.post('/validate', requireAuth, validateLayout);

// Upload event banner image
// POST /api/v1/layouts/upload-banner
router.post('/upload-banner', requireAuth, upload.single('banner'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: { code: 'NO_FILE', message: 'No file uploaded' }
        });
    }

    // req.file.path contains the secure URL returned by Cloudinary
    return res.status(201).json({
        success: true,
        data: { url: req.file.path }
    });
});

export default router;
