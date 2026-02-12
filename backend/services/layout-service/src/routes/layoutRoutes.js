import express from 'express';
import {
    getLayoutByEvent,
    createLayout,
    updateLayout,
    deleteLayout,
    validateLayout,
    getAllLayouts
} from '../controllers/layoutController.js';

// ... (middleware)

const router = express.Router();

// Public or Authenticated routes
router.get('/', getAllLayouts); // GET /api/v1/layouts
router.get('/event/:eventId', getLayoutByEvent);

// Protected routes (Organizer/Admin)
router.post('/', createLayout);
router.put('/event/:eventId', updateLayout);
router.delete('/event/:eventId', deleteLayout);
router.post('/validate', validateLayout);

export default router;
