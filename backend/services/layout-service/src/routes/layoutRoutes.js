import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
    getLayoutByEvent,
    createLayout,
    updateLayout,
    deleteLayout,
    validateLayout,
    getAllLayouts,
    getMyLayouts
} from '../controllers/layoutController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer storage for event banner uploads
const bannersDir = path.join(process.cwd(), 'uploads', 'banners');
fs.mkdirSync(bannersDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, bannersDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${base}-${unique}${ext}`);
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

    const relativePath = `/uploads/banners/${req.file.filename}`;

    return res.status(201).json({
        success: true,
        data: { url: relativePath }
    });
});

export default router;
