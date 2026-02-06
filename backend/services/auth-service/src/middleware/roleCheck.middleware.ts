import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { User } from '../models/user.model';

export const roleCheck = (allowedRoles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ message: 'Không có thông tin người dùng' });
            }

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ 
                    message: 'Bạn không có quyền truy cập tài nguyên này',
                    requiredRoles: allowedRoles,
                    yourRole: user.role,
                });
            }

            next();
        } catch (error) {
            console.error('❌ [ROLE CHECK] Error:', error);
            return res.status(500).json({ message: 'Lỗi kiểm tra quyền truy cập' });
        }
    };
};
