import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middlewares cơ bản cho API Gateway
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký toàn bộ route & proxy
setupRoutes(app);

// Middleware xử lý lỗi cuối cùng
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`API Gateway is running at http://localhost:${PORT}`);
});

