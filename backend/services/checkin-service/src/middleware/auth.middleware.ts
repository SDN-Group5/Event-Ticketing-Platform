import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Không có token xác thực' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error('❌ [CHECKIN] Token verification failed:', error);
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export const requireStaffRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userRole) {
    return res.status(401).json({ success: false, message: 'Không có thông tin vai trò người dùng' });
  }

  if (req.userRole !== 'staff' && req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ nhân viên check-in hoặc admin mới được phép sử dụng chức năng này',
      yourRole: req.userRole,
    });
  }

  next();
};

export const requireOrganizerOrStaff = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userRole) {
    return res.status(401).json({ success: false, message: 'Không có thông tin vai trò người dùng' });
  }

  const allowed = ['staff', 'admin', 'organizer'];
  if (!allowed.includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập',
      yourRole: req.userRole,
    });
  }

  next();
};

