import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { connectRabbitMQ } from './config/rabbitmq';
import paymentRoutes from './routes/payment.routes';
import { startOrderCleanupJob } from './jobs/orderCleanup';

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 4004;

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
    stream: { write: (msg) => console.log(`[payment-service] ${msg.trim()}`) },
  })
);

app.get('/health', (req, res) => {
  res.json({
    service: 'payment-service',
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/payments', paymentRoutes);

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  startOrderCleanupJob();
  app.listen(PORT, () => {
    console.log('💳 ============================================');
    console.log(`✅ payment-service đang chạy tại port: ${PORT}`);
    console.log(`🐰 RabbitMQ: Event-Driven mode`);
    console.log(`🌐 Health: http://localhost:${PORT}/health`);
    console.log('💳 ============================================');
  });
};

start();
