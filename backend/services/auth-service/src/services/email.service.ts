const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const EMAIL_USER = process.env.EMAIL_USER || '';

async function sendMail(params: {
    to: string;
    subject: string;
    html: string;
    fromName?: string;
}): Promise<boolean> {
    if (!BREVO_API_KEY) {
        console.warn('⚠️  [EMAIL] BREVO_API_KEY chưa cấu hình.');
        return false;
    }
    if (!EMAIL_USER) {
        console.warn('⚠️  [EMAIL] EMAIL_USER chưa cấu hình (dùng làm sender).');
        return false;
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: params.fromName || 'TicketVibe', email: EMAIL_USER },
            to: [{ email: params.to }],
            subject: params.subject,
            htmlContent: params.html,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Brevo ${res.status}: ${body}`);
    }

    return true;
}

// ============================================
// SEND VERIFICATION EMAIL
// ============================================
interface VerificationEmailParams {
    to: string;
    firstName: string;
    code: string;
}

export const sendVerificationEmail = async ({ to, firstName, code }: VerificationEmailParams): Promise<boolean> => {
    try {
        const ok = await sendMail({
            to,
            fromName: 'TicketVibe',
            subject: '🔐 Xác thực email - TicketVibe',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #a855f7; margin: 0; font-size: 28px;">🎫 TicketVibe</h1>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                        <h2 style="color: #ffffff; margin-top: 0;">Xin chào ${firstName}! 👋</h2>
                        <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
                            Cảm ơn bạn đã đăng ký tài khoản TicketVibe. Để hoàn tất quá trình đăng ký,
                            vui lòng nhập mã xác thực bên dưới:
                        </p>
                        <div style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                            <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; opacity: 0.9;">Mã xác thực của bạn:</p>
                            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${code}</div>
                        </div>
                        <p style="color: #9ca3af; font-size: 14px;">⏰ Mã này sẽ hết hạn sau <strong style="color: #f59e0b;">1 phút</strong>.</p>
                        <p style="color: #9ca3af; font-size: 14px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                    </div>
                    <div style="text-align: center; color: #6b7280; font-size: 12px;"><p>© 2024 TicketVibe. All rights reserved.</p></div>
                </div>
            `,
        });
        if (ok) console.log(`✅ [EMAIL] Verification email sent to ${to}`);
        else console.log(`📧 [EMAIL] Fallback - OTP code for ${to}: ${code}`);
        return ok;
    } catch (error) {
        console.error('❌ [EMAIL] Failed to send verification email:', error);
        console.log(`📧 [EMAIL] Fallback - OTP code for ${to}: ${code}`);
        return false;
    }
};

// ============================================
// SEND RESET PASSWORD EMAIL
// ============================================
interface ResetPasswordEmailParams {
    to: string;
    firstName: string;
    code: string;
}

export const sendResetPasswordEmail = async ({ to, firstName, code }: ResetPasswordEmailParams): Promise<boolean> => {
    try {
        const ok = await sendMail({
            to,
            fromName: 'TicketVibe',
            subject: '🔑 Đặt lại mật khẩu - TicketVibe',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #a855f7; margin: 0; font-size: 28px;">🎫 TicketVibe</h1>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                        <h2 style="color: #ffffff; margin-top: 0;">Xin chào ${firstName}! 👋</h2>
                        <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                            Vui lòng sử dụng mã bên dưới để đặt lại mật khẩu:
                        </p>
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                            <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; opacity: 0.9;">Mã đặt lại mật khẩu:</p>
                            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${code}</div>
                        </div>
                        <p style="color: #9ca3af; font-size: 14px;">⏰ Mã này sẽ hết hạn sau <strong style="color: #f59e0b;">1 phút</strong>.</p>
                        <p style="color: #9ca3af; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
                    </div>
                    <div style="text-align: center; color: #6b7280; font-size: 12px;"><p>© 2024 TicketVibe. All rights reserved.</p></div>
                </div>
            `,
        });
        if (ok) console.log(`✅ [EMAIL] Reset password email sent to ${to}`);
        else console.log(`📧 [EMAIL] Fallback - Reset code for ${to}: ${code}`);
        return ok;
    } catch (error) {
        console.error('❌ [EMAIL] Failed to send reset password email:', error);
        console.log(`📧 [EMAIL] Fallback - Reset code for ${to}: ${code}`);
        return false;
    }
};

// ============================================
// SEND PAYOUT NOTIFICATION EMAIL
// ============================================
interface PayoutEmailParams {
    to: string;
    organizerName: string;
    eventName: string;
    amount: number;
    receiptUrl?: string;
}

export const sendPayoutNotificationEmail = async ({ to, organizerName, eventName, amount, receiptUrl }: PayoutEmailParams): Promise<boolean> => {
    try {
        const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        const ok = await sendMail({
            to,
            fromName: 'TicketVibe Admin',
            subject: '💰 Thông báo thanh toán doanh thu sự kiện - TicketVibe',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #a855f7; margin: 0; font-size: 28px;">🎫 TicketVibe Admin</h1>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                        <h2 style="color: #ffffff; margin-top: 0;">Xin chào ${organizerName},</h2>
                        <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
                            TicketVibe đã hoàn tất việc thanh toán doanh thu cho sự kiện <strong>${eventName}</strong> của bạn.
                        </p>
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                            <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; opacity: 0.9;">Số tiền đã chuyển khoản:</p>
                            <div style="font-size: 32px; font-weight: bold; color: #ffffff;">${formattedAmount}</div>
                        </div>
                        ${receiptUrl ? `
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="${receiptUrl}" target="_blank" style="background-color: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Xem biên lai chuyển khoản</a>
                        </div>` : ''}
                        <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">Nếu bạn có bất kỳ thắc mắc nào về khoản thanh toán này, vui lòng liên hệ với ban quản trị TicketVibe.</p>
                    </div>
                    <div style="text-align: center; color: #6b7280; font-size: 12px;">
                        <p>Cảm ơn bạn đã đồng hành cùng TicketVibe!</p>
                        <p>© 2024 TicketVibe. All rights reserved.</p>
                    </div>
                </div>
            `,
        });
        if (ok) console.log(`✅ [EMAIL] Payout notification email sent to ${to}`);
        return ok;
    } catch (error) {
        console.error('❌ [EMAIL] Failed to send payout notification email:', error);
        return false;
    }
};
