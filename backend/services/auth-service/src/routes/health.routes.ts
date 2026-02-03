import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * @route GET /health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    service: 'auth-service',
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'N/A',
    },
  });
});

export default router;
