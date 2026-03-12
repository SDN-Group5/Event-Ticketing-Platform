import { Express, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Options } from 'http-proxy-middleware';

// ============================================
// SERVICE URLS (từ env hoặc default)
// ============================================
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const LAYOUT_SERVICE_URL = process.env.LAYOUT_SERVICE_URL || 'http://localhost:4002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:4003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4004';

// ============================================
// PROXY OPTIONS
// ============================================
const createProxy = (target: string, pathRewrite?: Record<string, string>, ws: boolean = false): Options => ({
  target,
  changeOrigin: true,
  pathRewrite,
  ws,
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
    // Forward cookies/headers if needed
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
    // Forward Authorization header so downstream services can verify JWT
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
} as Options);

export const socketIoProxy = createProxyMiddleware(createProxy(LAYOUT_SERVICE_URL, undefined, true));

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
        layout: LAYOUT_SERVICE_URL,
        booking: BOOKING_SERVICE_URL,
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
        '/socket.io',
        '/api/auth/*',
        '/api/users/*',
        '/api/v1/layouts/*',
        '/api/bookings/*',
        '/api/payments/*',

      ],
    });
  });

  // ============================================
  // PROXY TO MICROSERVICES
  // ============================================

  // WebSocket for Seat Service
  app.use('/socket.io', socketIoProxy);

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

  // User Service (Auth Service) - current user & admin user management
  //  - FE:        /api/users/me, /api/users
  //  - Gateway:   proxy nguyên prefix `/api/users` sang auth-service
  //  - Upstream:  auth-service expose `/api/users/...` (xem user.routes.ts)
  app.use(
    '/api/users',
    // Thêm prefix `/api/users` vào trước path vì app.use đã loại bỏ nó
    createProxyMiddleware(createProxy(AUTH_SERVICE_URL, { '^/(?!api/users)': '/api/users/' }))
  );


  // Layout Service
  app.use(
    '/api/v1/layouts',
    createProxyMiddleware(createProxy(LAYOUT_SERVICE_URL))
  );

  // Seat & layout real-time API (zones, seats, reserve/purchase/release)
  // Layout-service expose các route dưới prefix `/api/v1/...`
  // nên gateway cần proxy luôn `/api/v1` sang layout-service.
  // Lưu ý: khi mount tại '/api/v1', http-proxy-middleware sẽ bỏ prefix này
  // trước khi forward. Vì layout-service cũng mong đợi prefix '/api/v1',
  // ta cộng thêm '/api/v1' vào target URL để giữ nguyên path:
  //   FE:        /api/v1/events/:eventId/seats
  //   Gateway:   mount /api/v1  -> forward /events/:eventId/seats tới
  //              target `${LAYOUT_SERVICE_URL}/api/v1`
  //   Upstream:  /api/v1/events/:eventId/seats  (đúng với layout-service)
  app.use(
    '/api/v1',
    createProxyMiddleware(createProxy(`${LAYOUT_SERVICE_URL}/api/v1`))
  );

  // Booking Service: /api/bookings/*, /api/customer/*
  app.use(
    '/api/bookings',
    createProxyMiddleware(createProxy(BOOKING_SERVICE_URL))
  );
  app.use(
    '/api/customer',
    createProxyMiddleware(createProxy(BOOKING_SERVICE_URL))
  );

  // Payment Service: /api/payments/* — khi proxy gửi path tương đối (vd /create) thì thêm prefix /api/payments/
  app.use(
    '/api/payments',
    createProxyMiddleware(
      createProxy(PAYMENT_SERVICE_URL, { '^/(?!api/payments|api/analytics)': '/api/payments/' })
    )
  );

  app.use(
    '/api/analytics',
    createProxyMiddleware(
      createProxy(PAYMENT_SERVICE_URL, { '^/(?!api/analytics)': '/api/analytics/' })
    )
  );

  // Staff (check-in) -> Booking Service
  app.use(
    '/api/staff',
    createProxyMiddleware(createProxy(BOOKING_SERVICE_URL))
  );

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} không tồn tại`,
    });
  });
};