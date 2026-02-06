import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key';

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Lấy token từ header Authorization hoặc cookie
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Không có token xác thực' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };
        
        req.userId = decoded.userId;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        console.error('❌ [AUTH] Token verification failed:', error);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

export default verifyToken;
