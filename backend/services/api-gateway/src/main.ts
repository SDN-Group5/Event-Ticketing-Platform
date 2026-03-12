import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { setupRoutes, socketIoProxy } from './routes/index';

// Load env from backend/.env
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(
  morgan('combined', {
    stream: { write: (msg) => console.log(`[api-gateway] ${msg.trim()}`) },
  }),
);

setupRoutes(app);

const server = app.listen(PORT, () => {
  console.log('🚀 ============================================');
  console.log(`✅ api-gateway đang chạy tại port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log('🚀 ============================================');
});

server.on('upgrade', (socketIoProxy as any).upgrade);

