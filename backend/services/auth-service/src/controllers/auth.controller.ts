import { Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, sendResetPasswordEmail } from "../services/email.service";

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
        const { email, password } = req.body;

        console.log('🔐 [LOGIN] Incoming request', {
            email,
            hasPassword: !!password,
            bodyKeys: Object.keys(req.body || {}),
            path: req.path,
            method: req.method,
        });

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.warn(`❌ [LOGIN] User not found for email: ${email}`);
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        if (user.isActive === false) {
            console.error(`❌ Login failed: User ${email} is inactive`);
            return res.status(401).json({ 
                message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên." 
            });
        }

        if (user.emailVerified === false) {
            return res.status(403).json({
                message: "Email chưa được xác thực. Vui lòng kiểm tra email để nhập mã xác thực.",
                requiresEmailVerification: true,
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            console.error(`❌ [LOGIN] Password mismatch for user ${email}`);
            return res.status(401).json({ message: "Mật khẩu không khớp" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY as string,
            {
              expiresIn: "1d",
            }
          );
      
        console.log(`✅ [LOGIN] Success for user ${email} (role=${user.role})`);

        return res.status(200).json({
            userId: user._id,
            message: "Login successful",
            token: token,
            user: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
            },
        });
    } catch (error) {
        console.error("❌ Lỗi login:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
      
// ============================================
// GET /api/auth/validate-token
export const validateToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({ 
      userId: userId,
      role: user.role 
    });
  } catch (error) {
    console.error("❌ Lỗi validateToken:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const logout = (req: Request, res: Response) => {
    try {
        res.clearCookie("jwt");
        res.clearCookie("session_id");
        return res.status(200).json({ message: "Logout thành công" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Logout bị lỗi nè bạn ơi" });
    }
}

// ============================================
// POST /api/auth/register
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
            password,
            role: "customer",
            emailVerified: false,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: verificationExpires,
            isActive: true,
        });

        console.log(`✅ User created: ${user.email}`);

        try {
            const emailResult = await sendVerificationEmail({
                to: user.email,
                firstName: user.firstName,
                code: verificationCode,
            });
            
            if (emailResult) {
                console.log(`✅ [REGISTER] Email verification đã được gửi thành công đến ${user.email}`);
            } else {
                console.error(`❌ [REGISTER] Email service trả về false cho ${user.email}`);
                console.error(`⚠️  [REGISTER] OTP code: ${verificationCode} - Vui lòng kiểm tra email config`);
            }
        } catch (emailError: any) {
            console.error("❌ [REGISTER] Lỗi khi gửi email:", emailError);
            console.error(`⚠️  [REGISTER] Email không được gửi! OTP for ${user.email}: ${verificationCode}`);
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
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                message: "Nếu email tồn tại, chúng tôi đã gửi mã reset password đến email của bạn.",
            });
        }

        const resetCode = generate6DigitCode();
        const resetExpires = getOtpExpiryDate(1);

        user.passwordResetCode = resetCode as any;
        user.passwordResetExpires = resetExpires as any;
        await user.save();

        console.log(`📝 [FORGOT-PASSWORD] Reset code generated for ${email}: ${resetCode}`);

        try {
            await sendResetPasswordEmail({
                to: user.email,
                firstName: user.firstName,
                code: resetCode,
            });
            console.log(`✅ [FORGOT-PASSWORD] Reset password email sent to ${user.email}`);
        } catch (emailError: any) {
            console.error("❌ [FORGOT-PASSWORD] Lỗi khi gửi email:", emailError);
            console.error(`⚠️  [FORGOT-PASSWORD] Email không được gửi! Reset code for ${user.email}: ${resetCode}`);
        }

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
export const verifyResetCode = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        if (!user.passwordResetCode || !user.passwordResetExpires) {
            return res.status(400).json({ message: "Không có mã reset. Vui lòng yêu cầu reset password lại." });
        }

        if (user.passwordResetExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: "Mã reset đã hết hạn. Vui lòng yêu cầu reset password lại." });
        }

        if (user.passwordResetCode !== String(code)) {
            return res.status(400).json({ message: "Mã reset không đúng" });
        }

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
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        if (!user.passwordResetCode || !user.passwordResetExpires) {
            return res.status(400).json({ message: "Không có mã reset. Vui lòng yêu cầu reset password lại." });
        }

        if (user.passwordResetExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: "Mã reset đã hết hạn. Vui lòng yêu cầu reset password lại." });
        }

        if (user.passwordResetCode !== String(code)) {
            return res.status(400).json({ message: "Mã reset không đúng" });
        }

        user.password = newPassword;
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
