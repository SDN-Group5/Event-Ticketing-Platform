import jwt from 'jsonwebtoken';

// Đọc secret giống auth-service (JWT_SECRET_KEY)
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key';

export const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Thiếu token xác thực'
                }
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Chuẩn hóa lại giống layoutController đang dùng: req.user.id
        req.user = {
            id: decoded.userId || decoded.id,
            role: decoded.role,
            email: decoded.email
        };

        if (!req.user.id) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Token không hợp lệ (không có user id)'
                }
            });
        }

        next();
    } catch (error) {
        console.error('❌ [LAYOUT AUTH] Token verification failed:', error);
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Token không hợp lệ hoặc đã hết hạn'
            }
        });
    }
};

