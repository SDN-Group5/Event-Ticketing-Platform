import { Request, Response } from "express";
import User from "../../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpExpiryDate(minutes = 1) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

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

        // B2.5: Nếu policy yêu cầu verify email trước khi login
        // (mặc định: chặn login nếu chưa verify)
        if (user.emailVerified === false) {
            return res.status(403).json({
                message: "Email chưa được xác thực. Vui lòng kiểm tra email để nhập mã xác thực.",
                requiresEmailVerification: true,
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
export const validateToken = async (req: Request, res: Response) => {
  try {
    // req.userId được set bởi middleware verifyToken
    // Lấy thông tin user để trả về role
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({ 
      userId: req.userId,
      role: user.role 
    });
  } catch (error) {
    console.error("❌ Lỗi validateToken:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
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

// ============================================
// POST /api/auth/register
// Note: hiện tại backend sẽ tạo user + tạo OTP verify email.
// OTP được log ra console để dev test (sau này tích hợp provider email).
export const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email đã tồn tại" });
        }

        const verificationCode = generate6DigitCode();
        const verificationExpires = getOtpExpiryDate(1);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password, // sẽ hash bởi pre-save hook
            role: "customer",
            emailVerified: false,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: verificationExpires,
            isActive: true,
        });

        // Dev-mode "send email": log OTP để test nhanh
        console.log(
            `📧 [DEV] Email verification code for ${email}: ${verificationCode} (expires ${verificationExpires.toISOString()})`
        );

        return res.status(201).json({
            message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
            requiresEmailVerification: true,
            email: user.email,
        });
    } catch (error) {
        console.error("❌ Lỗi register:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// ============================================
// POST /api/auth/verify-email
// Input: { email, code }
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        if (user.emailVerified === true) {
            return res.status(200).json({ message: "Email đã được xác thực rồi" });
        }

        if (!user.emailVerificationCode || !user.emailVerificationExpires) {
            return res.status(400).json({ message: "Không có mã xác thực. Vui lòng bấm gửi lại mã." });
        }

        if (user.emailVerificationExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: "Mã xác thực đã hết hạn. Vui lòng bấm gửi lại mã." });
        }

        if (user.emailVerificationCode !== String(code)) {
            return res.status(400).json({ message: "Mã xác thực không đúng" });
        }

        user.emailVerified = true;
        user.emailVerificationCode = null as any;
        user.emailVerificationExpires = null as any;
        await user.save();

        return res.status(200).json({ message: "Xác thực email thành công" });
    } catch (error) {
        console.error("❌ Lỗi verifyEmail:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// ============================================
// POST /api/auth/resend-verification
// Input: { email }
export const resendVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        if (user.emailVerified === true) {
            return res.status(200).json({ message: "Email đã được xác thực rồi" });
        }

        const verificationCode = generate6DigitCode();
        const verificationExpires = getOtpExpiryDate(1);

        user.emailVerificationCode = verificationCode as any;
        user.emailVerificationExpires = verificationExpires as any;
        await user.save();

        console.log(
            `📧 [DEV] Resent email verification code for ${email}: ${verificationCode} (expires ${verificationExpires.toISOString()})`
        );

        return res.status(200).json({
            message: "Đã gửi lại mã xác thực. Vui lòng kiểm tra email.",
        });
    } catch (error) {
        console.error("❌ Lỗi resendVerification:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};