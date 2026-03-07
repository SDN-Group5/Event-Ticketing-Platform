import { Express, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Options } from 'http-proxy-middleware';

// ============================================
// SERVICE URLS (từ env hoặc default)
// ============================================
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:4002';
const LAYOUT_SERVICE_URL = process.env.LAYOUT_SERVICE_URL || 'http://localhost:4003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4004';

// ============================================
// PROXY OPTIONS
// ============================================
const createProxy = (target: string, pathRewrite?: Record<string, string>): Options => ({
  target,
  changeOrigin: true,
  pathRewrite,
  /**
   * Tăng timeout để tránh gateway tự trả 408 trước khi service con xử lý xong.
   *  - timeout: thời gian chờ response từ upstream (ms)
   *  - proxyTimeout: thời gian chờ kết nối tới upstream (ms)
   */
  timeout: 60_000,
  proxyTimeout: 60_000,
  /**
   * Xử lý lỗi từ upstream (http-proxy-middleware v2 dùng onError/onProxyReq ở cấp root).
   */
  onError: (err, req, res: any) => {
    console.error(`[Proxy Error] ${target}:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: `Service unavailable: ${target}`,
        error: err.message,
      });
    }
  },
  onProxyReq: (proxyReq, req) => {
    // Forward cookies/headers nếu cần
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
  },
} as Options);

// ============================================
// SETUP ROUTES
// ============================================
export const setupRoutes = (app: Express) => {
  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      service: 'api-gateway',
      status: 'ok',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      downstream: {
        auth: AUTH_SERVICE_URL,
        event: EVENT_SERVICE_URL,
        layout: LAYOUT_SERVICE_URL,
        payment: PAYMENT_SERVICE_URL,
      },
    });
  });

  // Root
  app.get('/', (req: Request, res: Response) => {
    res.json({
      service: 'Event Ticketing API Gateway',
      version: '1.0.0',
      endpoints: [
        '/health',
        '/api/auth/*',
        '/api/events/*',
        '/api/v1/layouts/*',
        '/api/payments/*',
      ],
    });
  });

  // ============================================
  // PROXY TO MICROSERVICES
  // ============================================

  // Auth Service: /api/auth/* -> auth-service:4001/login, /register, ...
  //  - Gateway prefix `/api/auth` được bỏ đi trước khi forward,
  //  - Auth-service expose các route `/login`, `/register`, ...
  app.use(
    '/api/auth',
    createProxyMiddleware(
      createProxy(AUTH_SERVICE_URL, {
        '^/api/auth': '',
      }),
    )
  );

  // Event Service: /api/events/*, /api/organizer/*, /api/admin/*
  app.use(
    '/api/events',
    createProxyMiddleware(createProxy(EVENT_SERVICE_URL))
  );
  app.use(
    '/api/organizer',
    createProxyMiddleware(createProxy(EVENT_SERVICE_URL))
  );
  app.use(
    '/api/admin',
    createProxyMiddleware(createProxy(EVENT_SERVICE_URL))
  );

  // Layout Service
  app.use(
    '/api/v1/layouts',
    createProxyMiddleware(createProxy(LAYOUT_SERVICE_URL))
  );

  // Payment Service: /api/payments/* — khi proxy gửi path tương đối (vd /create) thì thêm prefix /api/payments/
  app.use(
    '/api/payments',
    createProxyMiddleware(
      createProxy(PAYMENT_SERVICE_URL, { '^/(?!api/payments)': '/api/payments/' })
    )
  );

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} không tồn tại`,
    });
  });
};