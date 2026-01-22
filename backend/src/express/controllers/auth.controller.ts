import { Request, Response } from "express";
import User from "../../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


// ============================================
// POST /api/auth/login

export const login = async (req: Request, res: Response) => {
    try {
        // Lấy email và password từ req.body
        const { email, password } = req.body;

        // B1: Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        // B2: Kiểm tra user có đang active không
        if (user.isActive === false) {
            console.error(`❌ Login failed: User ${email} is inactive`);
            return res.status(401).json({ 
                message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên." 
            });
        }

        // B3: So sánh password
        const isMatch = await bcrypt.compare(password, user.password); // bcrypt.compare -> so sánh password từ req.body với password đã hash trong database

        //nếu password không khớp
        if (!isMatch) {
            console.error(`❌ Login failed: Password mismatch for user ${email}`);
            return res.status(401).json({ message: "Mật khẩu không khớp" });
        }

        // B4: Tạo JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET_KEY as string,
            {
              expiresIn: "1d",
            }
          );
      
          // Bước 5: Trả về response với token
          // Trả token trong response body (để frontend lưu vào localStorage)
        res.status(200).json({
            userId: user._id,
            message: "Login successful",
            token: token, // JWT token trong response body
            user: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role, // ✅ THÊM: Trả về role để frontend biết
            },
        });
    } catch (error) {
        console.error("❌ Lỗi login:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
      
// ============================================
// FUNCTION: validateToken
// MỤC ĐÍCH: Xác thực token (kiểm tra token còn hợp lệ không)
// ENDPOINT: GET /api/auth/validate-token
// MIDDLEWARE: verifyToken (đã được gọi ở routes)
// ============================================
export const validateToken = (req: Request, res: Response) => {
// req.userId được set bởi middleware verifyToken
// Nếu đến được đây nghĩa là token hợp lệ
res.status(200).send({ userId: req.userId });
};

export const logout = (req: Request, res: Response) => {
    try {
        // Xóa cookie bằng cách set cookie với giá trị rỗng và expires = 0
        res.cookie("session_id", "", {
            expires: new Date(0), // Thời gian hết hạn = 0 (ngay lập tức)
            maxAge: 0,             // Thời gian sống = 0
            httpOnly: false,        // Cookie chỉ đọc được bởi server (không thể đọc bằng JavaScript)
            secure: true,        // Chỉ gửi qua HTTPS
            sameSite: "none",  // CSRF protection
            path: "/",         // Áp dụng cho toàn bộ website 
        })
        return res.status(200).json({ message: "Logout thành công" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Logout bị lỗi nè bạn ơi" });
    }
}