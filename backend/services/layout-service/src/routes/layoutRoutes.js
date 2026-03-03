import express from 'express';
import {
    getLayoutByEvent,
    createLayout,
    updateLayout,
    deleteLayout,
    validateLayout,
    getAllLayouts
} from '../controllers/layoutController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllLayouts); // GET /api/v1/layouts
router.get('/event/:eventId', getLayoutByEvent);

// Protected routes (Organizer/Admin) - cần token để lấy createdBy
router.post('/', requireAuth, createLayout);
router.put('/event/:eventId', requireAuth, updateLayout);
router.delete('/event/:eventId', requireAuth, deleteLayout);
router.post('/validate', requireAuth, validateLayout);

export default router;
