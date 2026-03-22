import express from 'express';
import { getOverviewAnalytics, getAdminEventRevenues } from '../controllers/analytics.controller';
import { extractUserId, verifyOrganizer } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/overview', extractUserId, verifyOrganizer, getOverviewAnalytics);

// Admin: Get event revenues for payouts
router.get('/admin/event-revenues', getAdminEventRevenues);

export default router;
