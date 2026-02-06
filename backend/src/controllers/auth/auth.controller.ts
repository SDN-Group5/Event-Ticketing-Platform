import { Request, Response } from "express";
import User from "../../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, sendResetPasswordEmail } from "../../services/email.service";

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

        console.log(`📝 Registering user: ${email}`);
        console.log(`🔢 Generated OTP: ${verificationCode}`);

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

        console.log(`✅ User created: ${user.email}`);
        console.log(`📧 Sending verification email to: ${user.email}`);

        // Gửi email OTP verification (bắt buộc - không fallback)
        console.log(`📧 [REGISTER] Bắt đầu gửi email đến: ${user.email}`);
        console.log(`📧 [REGISTER] OTP code: ${verificationCode}`);
        
        try {
            const emailResult = await sendVerificationEmail({
                to: user.email, // ✅ Gửi đến email user đăng ký
                firstName: user.firstName,
                code: verificationCode, // ✅ Mã OTP thật (random 6 số)
            });
            
            if (emailResult) {
                console.log(`✅ [REGISTER] Email verification đã được gửi thành công đến ${user.email}`);
            } else {
                console.error(`❌ [REGISTER] Email service trả về false cho ${user.email}`);
                console.error(`⚠️  [REGISTER] OTP code: ${verificationCode} - Vui lòng kiểm tra email config`);
            }
        } catch (emailError: any) {
            console.error("❌ [REGISTER] Lỗi khi gửi email:", emailError);
            console.error("❌ [REGISTER] Error message:", emailError?.message);
            // Nếu không gửi được email, vẫn trả về success nhưng log OTP ra console để dev test
            console.error(`⚠️  [REGISTER] Email không được gửi! OTP for ${user.email}: ${verificationCode}`);
            console.error("⚠️  [REGISTER] User vẫn có thể register, nhưng cần verify email sau.");
            // Không throw error để user vẫn có thể register (có thể verify sau)
        }

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

        // Gửi email OTP verification
        try {
            const emailSent = await sendVerificationEmail({
                to: user.email,
                firstName: user.firstName,
                code: verificationCode,
            });
            
            if (!emailSent) {
                console.warn(`⚠️  Email không được gửi, nhưng OTP đã được log ra console`);
            }
        } catch (emailError) {
            console.error("❌ Lỗi khi gửi email:", emailError);
            // Vẫn tiếp tục, không throw error để user vẫn có thể resend
        }

        return res.status(200).json({
            message: "Đã gửi lại mã xác thực. Vui lòng kiểm tra email.",
        });
    } catch (error) {
        console.error("❌ Lỗi resendVerification:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// ============================================
// POST /api/auth/forgot-password
// Input: { email }
// Mục đích: Gửi mã OTP 6 số để reset password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            // Không trả về lỗi chi tiết để tránh email enumeration
            return res.status(200).json({
                message: "Nếu email tồn tại, chúng tôi đã gửi mã reset password đến email của bạn.",
            });
        }

        // Tạo mã OTP 6 số
        const resetCode = generate6DigitCode();
        const resetExpires = getOtpExpiryDate(1);

        // Lưu mã reset vào database
        user.passwordResetCode = resetCode as any;
        user.passwordResetExpires = resetExpires as any;
        await user.save();

        console.log(`📝 [FORGOT-PASSWORD] Reset code generated for ${email}: ${resetCode}`);

        // Gửi email chứa mã reset
        try {
            await sendResetPasswordEmail({
                to: user.email,
                firstName: user.firstName,
                code: resetCode,
            });
            console.log(`✅ [FORGOT-PASSWORD] Reset password email sent to ${user.email}`);
        } catch (emailError: any) {
            console.error("❌ [FORGOT-PASSWORD] Lỗi khi gửi email:", emailError);
            // Vẫn trả về success để không leak thông tin
            console.error(`⚠️  [FORGOT-PASSWORD] Email không được gửi! Reset code for ${user.email}: ${resetCode}`);
        }

        // Trả về message chung (không leak thông tin)
        return res.status(200).json({
            message: "Nếu email tồn tại, chúng tôi đã gửi mã reset password đến email của bạn.",
        });
    } catch (error) {
        console.error("❌ Lỗi forgotPassword:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// ============================================
// POST /api/auth/verify-reset-code
// Input: { email, code }
// Mục đích: Verify mã OTP reset password
export const verifyResetCode = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        // Kiểm tra có mã reset không
        if (!user.passwordResetCode || !user.passwordResetExpires) {
            return res.status(400).json({ message: "Không có mã reset. Vui lòng yêu cầu reset password lại." });
        }

        // Kiểm tra mã đã hết hạn chưa
        if (user.passwordResetExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: "Mã reset đã hết hạn. Vui lòng yêu cầu reset password lại." });
        }

        // Kiểm tra mã có đúng không
        if (user.passwordResetCode !== String(code)) {
            return res.status(400).json({ message: "Mã reset không đúng" });
        }

        // Mã hợp lệ
        return res.status(200).json({
            message: "Mã reset hợp lệ. Bạn có thể đặt lại mật khẩu.",
        });
    } catch (error) {
        console.error("❌ Lỗi verifyResetCode:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// ============================================
// POST /api/auth/reset-password
// Input: { email, code, newPassword }
// Mục đích: Đặt lại mật khẩu mới
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;

        // Validate password
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        // Kiểm tra có mã reset không
        if (!user.passwordResetCode || !user.passwordResetExpires) {
            return res.status(400).json({ message: "Không có mã reset. Vui lòng yêu cầu reset password lại." });
        }

        // Kiểm tra mã đã hết hạn chưa
        if (user.passwordResetExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: "Mã reset đã hết hạn. Vui lòng yêu cầu reset password lại." });
        }

        // Kiểm tra mã có đúng không
        if (user.passwordResetCode !== String(code)) {
            return res.status(400).json({ message: "Mã reset không đúng" });
        }

        // Đặt lại mật khẩu mới
        user.password = newPassword; // Sẽ được hash bởi pre-save hook
        user.passwordResetCode = null as any;
        user.passwordResetExpires = null as any;
        await user.save();

        console.log(`✅ [RESET-PASSWORD] Password reset successful for ${user.email}`);

        return res.status(200).json({
            message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.",
        });
    } catch (error) {
        console.error("❌ Lỗi resetPassword:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
