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
            {
                userId: user._id.toString(),
                role: user.role,
                email: user.email,
            },
            process.env.JWT_SECRET_KEY as string,
            {
                // Thời gian sống của phiên đăng nhập: 1 ngày
                expiresIn: "1d",
            }
        );

        // Set JWT vào httpOnly cookie để dùng cho web
        const cookieMaxAgeMs = 1 * 24 * 60 * 60 * 1000; // 1 ngày
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: cookieMaxAgeMs,
        });

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
        const { firstName, lastName, email, password, role } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: "Email đã tồn tại" });
        }

        const verificationCode = generate6DigitCode();
        const verificationExpires = getOtpExpiryDate(1);

        console.log(`📝 Registering user: ${email} with role: ${role || 'customer'}`);
        console.log(`🔢 Generated OTP: ${verificationCode}`);

        // Validate role if provided, otherwise default to customer
        const allowedRoles = ["customer", "organizer"];
        const finalRole = role && allowedRoles.includes(role) ? role : "customer";

        const user = await User.create({
            firstName,
            lastName,
            email: normalizedEmail,
            password,
            role: finalRole,
            emailVerified: false,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: verificationExpires,
            isActive: true,
        });

        console.log(`✅ User created: ${user.email} as ${user.role}`);

        // Trả response ngay để tránh bị treo vì SMTP timeout trên môi trường deploy.
        // Việc gửi email chạy "background"; nếu fail sẽ log OTP để debug.
        res.status(201).json({
            message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
            requiresEmailVerification: true,
            email: user.email,
        });

        // Fire-and-forget email
        setTimeout(async () => {
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
        }, 0);

        return;
    } catch (error: any) {
        console.error("❌ Lỗi register:", error);

        // Chống lỗi Race Condition: Nếu User được tạo giữa lúc kiểm tra và lưu
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email đã tồn tại" });
        }

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

// ============================================
// POST /api/auth/google
export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { credential, access_token } = req.body;
        const token = access_token || credential;

        if (!token) {
            return res.status(400).json({ message: "Google token không hợp lệ" });
        }

        // Fetch user info from Google using access_token
        let googleUser: any;
        try {
            const googleRes = await fetch(
                `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
            );
            if (!googleRes.ok) {
                throw new Error("Failed to fetch Google user info");
            }
            googleUser = await googleRes.json();
        } catch (fetchError) {
            // Try as ID token (credential) via tokeninfo endpoint
            try {
                const tokenInfoRes = await fetch(
                    `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
                );
                if (!tokenInfoRes.ok) throw new Error("Invalid token");
                googleUser = await tokenInfoRes.json();
                // Map fields
                googleUser.given_name = googleUser.given_name;
                googleUser.family_name = googleUser.family_name;
            } catch {
                console.error("❌ [GOOGLE] Token verification failed:", fetchError);
                return res.status(401).json({ message: "Google token không hợp lệ" });
            }
        }

        const email = googleUser.email;
        const given_name = googleUser.given_name || googleUser.name || '';
        const family_name = googleUser.family_name || '';
        const picture = googleUser.picture || null;

        if (!email) {
            return res.status(401).json({ message: "Không thể lấy thông tin từ Google" });
        }

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                firstName: given_name || email.split("@")[0],
                lastName: family_name || "",
                email,
                password: `google_oauth_${Math.random().toString(36)}_${Date.now()}`,
                role: "customer",
                emailVerified: true,
                isActive: true,
                avatar: picture,
            });
            console.log(`✅ [GOOGLE] New user created: ${email}`);
        } else {
            if (picture && !user.avatar) {
                user.avatar = picture;
                await user.save();
            }
            console.log(`✅ [GOOGLE] Existing user logged in: ${email}`);
        }

        if (user.isActive === false) {
            return res.status(401).json({
                message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
            });
        }

        const jwtToken = jwt.sign(
            { userId: user._id.toString(), role: user.role, email: user.email },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "1d" }
        );

        res.cookie("jwt", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Google login successful",
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatar: user.avatar || null,
            },
        });
    } catch (error) {
        console.error("❌ Lỗi googleLogin:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// ============================================
// POST /api/auth/change-password
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
        }

        const user = await User.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Mật khẩu hiện tại không chính xác" });
        }

        user.password = newPassword;
        await user.save();

        console.log(`✅ [CHANGE-PASSWORD] Password changed successfully for ${user.email}`);

        return res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error("❌ Lỗi changePassword:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi đổi mật khẩu" });
    }
};
