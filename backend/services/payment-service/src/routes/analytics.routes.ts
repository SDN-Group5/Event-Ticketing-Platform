import express from 'express';
import { getOverviewAnalytics } from '../controllers/analytics.controller';
import { extractUserId, verifyOrganizer } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/overview', extractUserId, verifyOrganizer, getOverviewAnalytics);

export default router;
