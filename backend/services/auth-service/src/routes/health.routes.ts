import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({
        service: 'auth-service',
        status: 'ok',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

export default router;
