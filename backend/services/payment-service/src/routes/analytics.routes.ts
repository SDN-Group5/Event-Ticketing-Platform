import express from 'express';
import {
  getOverviewAnalytics,
  getAdminEventRevenues,
  getAdminOverview,
} from '../controllers/analytics.controller';
import { extractUserId, verifyOrganizer } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/overview', extractUserId, verifyOrganizer, getOverviewAnalytics);

// Admin: Platform-wide overview analytics
router.get('/admin/overview', getAdminOverview);

// Admin: Get event revenues for payouts
router.get('/admin/event-revenues', getAdminEventRevenues);

export default router;
