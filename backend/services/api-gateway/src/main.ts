import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

// ============================================
// CONFIGURATION
// ============================================
const PORT = process.env.PORT || 4000;
const SERVICE_NAME = 'api-gateway';

// ============================================
// CREATE EXPRESS APP
// ============================================
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet());
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Quá nhiều request, vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================
// CORS
// ============================================
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS không cho phép'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ============================================
// PARSING & LOGGING
// ============================================
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (msg) => console.log(`[${SERVICE_NAME}] ${msg.trim()}`) }
}));

// ============================================
// ROUTES
// ============================================
setupRoutes(app);

// ============================================
// ERROR HANDLING
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('🚀 ============================================');
  console.log(`✅ ${SERVICE_NAME} đang chạy tại port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`📚 Routes: /api/auth, /api/events, /api/bookings, /api/payments`);
  console.log('🚀 ============================================');
});

export default app;
