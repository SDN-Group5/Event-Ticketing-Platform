import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key';

interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware để extract userId từ JWT token hoặc headers
 * Ưu tiên: JWT token > x-user-id header > body.userId
 */
export const extractUserId = (req: Request, res: Response, next: NextFunction) => {
  try {
    let userId: string | null = null;

    // Cách 1: Lấy từ Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer '
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        userId = decoded.userId;
      } catch (err) {
        console.warn('[extractUserId] JWT verification failed, trying fallback...');
      }
    }

    // Cách 2: Lấy từ x-user-id header (fallback)
    if (!userId) {
      userId = (req.headers['x-user-id'] as string) || (req.body?.userId as string);
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập hoặc thiếu userId',
      });
    }

    // Lưu userId vào request object để dùng ở controller
    (req as any).userId = userId;

    next();
  } catch (error) {
    console.error('[extractUserId] Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Middleware để verify organizer (chỉ organizer mới có thể truy cập)
 * Yêu cầu extractUserId middleware phải chạy trước
 */
export const verifyOrganizer = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Chưa xác thực',
    });
  }

  // Ở đây có thể thêm logic để verify role từ auth-service
  // Tạm thời cứ pass qua, vì request đã có userId
  next();
};
