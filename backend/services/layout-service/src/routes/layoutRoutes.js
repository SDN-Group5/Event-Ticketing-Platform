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

// Configure Cloudinary (bắt buộc trên Railway/Vercel — thiếu biến môi trường → upload sẽ lỗi)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryConfigured =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

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
router.post('/upload-banner', requireAuth, (req, res) => {
    if (!cloudinaryConfigured) {
        console.error('[upload-banner] Thiếu CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET');
        return res.status(503).json({
            success: false,
            error: {
                code: 'CLOUDINARY_NOT_CONFIGURED',
                message:
                    'Server chưa cấu hình Cloudinary. Thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET trên Railway (Variables).'
            }
        });
    }

    upload.single('banner')(req, res, (err) => {
        if (err) {
            console.error('[upload-banner]', err?.message || err);
            const isImageFilter = err.message === 'Only image files are allowed';
            const isTooBig = err.code === 'LIMIT_FILE_SIZE';
            const msg = String(err.message || err.error?.message || '');
            const looksLikeCloudinary =
                /cloudinary|Invalid api_key|401|signature/i.test(msg) ||
                /Must supply api_key/i.test(msg);

            let status = 500;
            let message = 'Upload banner thất bại. Thử lại sau hoặc kiểm tra cấu hình Cloudinary.';

            if (isImageFilter) {
                status = 400;
                message = err.message;
            } else if (isTooBig) {
                status = 400;
                message = 'Ảnh quá lớn (tối đa 5MB).';
            } else if (looksLikeCloudinary) {
                status = 502;
                message = 'Lỗi kết nối Cloudinary (kiểm tra API key/secret trên server).';
            }

            return res.status(status).json({
                success: false,
                error: { code: 'UPLOAD_FAILED', message }
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: { code: 'NO_FILE', message: 'No file uploaded' }
            });
        }

        const url = req.file.path || req.file.secure_url || req.file.url;
        return res.status(201).json({
            success: true,
            data: { url }
        });
    });
});

export default router;
