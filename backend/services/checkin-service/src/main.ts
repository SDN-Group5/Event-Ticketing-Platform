import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import checkinRoutes from './routes/checkin.routes';

// ============================================
// LOAD ENV FROM backend/.env
// ============================================
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

const PORT = process.env.CHECKIN_SERVICE_PORT || 4005;
const SERVICE_NAME = 'checkin-service';
const MONGO_URI = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || '';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: (msg) => console.log(`[${SERVICE_NAME}] ${msg.trim()}`) },
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: SERVICE_NAME,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/checkin', checkinRoutes);

// 404 JSON handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Checkin Service: Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('💥 [CHECKIN-SERVICE] Global Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
  });
});

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      console.error(`❌ [${SERVICE_NAME}] MONGO_URI chưa được cấu hình. Vui lòng set MONGODB_CONNECTION_STRING trong backend/.env`);
      process.exit(1);
    }
    console.log(`🔌 [${SERVICE_NAME}] Kết nối MongoDB...`);
    await mongoose.connect(MONGO_URI);
    console.log(`✅ [${SERVICE_NAME}] MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`❌ [${SERVICE_NAME}] MongoDB connection error:`, error);
  }
};

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('🚀 ============================================');
    console.log(`✅ ${SERVICE_NAME} đang chạy tại port: ${PORT}`);
    console.log(`🌐 Health: http://localhost:${PORT}/health`);
    console.log(`📚 Checkin API: http://localhost:${PORT}/api/checkin`);
    console.log('🚀 ============================================');
  });
};

startServer();

export default app;

