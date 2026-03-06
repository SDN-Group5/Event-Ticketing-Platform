import jwt from 'jsonwebtoken';

// Nên thống nhất tên biến môi trường ở tất cả các service
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'your-secret-key';

// 1. Middleware kiểm tra Token (Lấy từ auth.js)
export const verifyToken = (req, res, next) => {
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

        // Chuẩn hóa req.user
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
        console.error('❌ [EVENT AUTH] Token verification failed:', error.message);
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Token không hợp lệ hoặc đã hết hạn'
            }
        });
    }
};

// 2. Middleware phân quyền (Lấy và mở comment từ auth.middleware.js)
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Kiểm tra xem role của user hiện tại có nằm trong danh sách cho phép không
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: `Bạn không có quyền. Yêu cầu quyền: ${allowedRoles.join(', ')}`
                }
            });
        }
        next();
    };
};