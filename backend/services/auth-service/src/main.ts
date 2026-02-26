import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';

// Export middleware để các service khác có thể dùng
export { default as verifyToken } from './middleware/auth.middleware';
export { roleCheck } from './middleware/roleCheck.middleware';
export { User } from './models/user.model';

// ============================================
// CONFIGURATION
// ============================================
const PORT = process.env.PORT || 4001;
const SERVICE_NAME = 'auth-service';
// Luôn ưu tiên MongoDB Atlas / connection string từ env, KHÔNG dùng localhost
const MONGO_URI = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || '';

// ============================================
// CREATE EXPRESS APP
// ============================================
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (msg) => console.log(`[${SERVICE_NAME}] ${msg.trim()}`) }
}));

// ============================================
// ROUTES
// ============================================
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    service: SERVICE_NAME,
    version: '1.0.0',
    endpoints: ['/health', '/api/auth', '/api/users'],
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================
const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      console.error(`❌ [${SERVICE_NAME}] MONGO_URI chưa được cấu hình. Vui lòng set MONGODB_CONNECTION_STRING trong auth-service/.env`);
      process.exit(1);
    }
    console.log(`🔌 [${SERVICE_NAME}] Kết nối MongoDB...`);
    await mongoose.connect(MONGO_URI);
    console.log(`✅ [${SERVICE_NAME}] MongoDB connected: ${mongoose.connection.name}`);
    console.log(`   🔗 URI: ${MONGO_URI}`);
    console.log(`   🗄  DB Name: ${mongoose.connection.name} | Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ [${SERVICE_NAME}] MongoDB connection error:`, error);
    // Không exit, cho phép service chạy với mock data nếu cần
  }
};

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('🚀 ============================================');
    console.log(`✅ ${SERVICE_NAME} đang chạy tại port: ${PORT}`);
    console.log(`🌐 Health: http://localhost:${PORT}/health`);
    console.log(`📚 Auth API: http://localhost:${PORT}/api/auth`);
    console.log('🚀 ============================================');
  });
};

startServer();

export default app;
