import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

// ============================================
// SEND PAYMENT CONFIRMATION EMAIL
// ============================================
interface PaymentConfirmationEmailParams {
  to: string;
  firstName: string;
  eventName: string;
  orderCode: number;
  totalAmount: number;
  items: { zoneName: string; quantity: number; price: number }[];
  ticketCount: number;
}

export const sendPaymentConfirmationEmail = async ({
  to,
  firstName,
  eventName,
  orderCode,
  totalAmount,
  items,
  ticketCount,
}: PaymentConfirmationEmailParams): Promise<boolean> => {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('⚠️  [EMAIL] Email credentials not configured.');
    console.log(`📧 [EMAIL] Would send payment confirmation to ${to} for order ${orderCode}`);
    return false;
  }

  try {
    // Format items
    const itemsHtml = items
      .map(
        (item) =>
          `
            <tr>
              <td style="padding: 12px; text-align: left; border-bottom: 1px solid #374151;">
                <span style="color: #d1d5db;">${item.zoneName}</span>
              </td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #374151;">
                <span style="color: #d1d5db;">x${item.quantity}</span>
              </td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #374151;">
                <span style="color: #a855f7; font-weight: bold;">₫${item.price.toLocaleString('vi-VN')}</span>
              </td>
            </tr>
          `
      )
      .join('');

    const mailOptions = {
      from: `"TicketVibe" <${EMAIL_USER}>`,
      to,
      subject: '🎉 Đơn hàng thanh toán thành công - TicketVibe',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #a855f7; margin: 0; font-size: 28px;">🎫 TicketVibe</h1>
          </div>

          <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
              <span style="font-size: 32px;">✅</span>
              <h2 style="color: #22c55e; margin: 0; font-size: 24px;">Thanh toán thành công!</h2>
            </div>

            <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-top: 0;">
              Xin chào <strong>${firstName}</strong>,
            </p>
            <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
              Cảm ơn bạn đã mua vé trên TicketVibe! Thanh toán của bạn đã được xác nhận thành công.
              Bên dưới là chi tiết đơn hàng của bạn:
            </p>

            <!-- Event Details -->
            <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #a855f7;">
              <p style="color: #a855f7; font-weight: bold; margin-top: 0; margin-bottom: 8px;">📍 Sự kiện</p>
              <h3 style="color: #ffffff; margin: 0 0 15px 0;">${eventName}</h3>

              <div style="color: #d1d5db; font-size: 14px; line-height: 2;">
                <p style="margin: 0;"><strong>Số lượng vé:</strong> ${ticketCount} vé</p>
                <p style="margin: 0;"><strong>Mã đơn hàng:</strong> <span style="color: #22c55e; font-weight: bold;">#${orderCode}</span></p>
              </div>
            </div>

            <!-- Order Items Table -->
            <div style="margin: 25px 0;">
              <p style="color: #a855f7; font-weight: bold; margin-bottom: 12px; font-size: 14px;">📋 Chi tiết vé</p>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: rgba(168, 85, 247, 0.1);">
                    <th style="padding: 12px; text-align: left; color: #a855f7; font-weight: bold;">Khu vực</th>
                    <th style="padding: 12px; text-align: center; color: #a855f7; font-weight: bold;">Số lượng</th>
                    <th style="padding: 12px; text-align: right; color: #a855f7; font-weight: bold;">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Total Amount -->
            <div style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; opacity: 0.9;">Tổng cộng</p>
              <div style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">
                ₫${totalAmount.toLocaleString('vi-VN')}
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #22c55e; font-weight: bold; margin-top: 0; margin-bottom: 10px;">📧 Bước tiếp theo</p>
              <ul style="color: #d1d5db; margin: 0; padding-left: 20px; font-size: 14px;">
                <li style="margin-bottom: 8px;">✓ Vé của bạn đang được chuẩn bị</li>
                <li style="margin-bottom: 8px;">✓ Bạn sẽ nhận được email với mã vé qr code trong vòng 24 giờ</li>
                <li>✓ Truy cập "Vé của tôi" để xem chi tiết vé</li>
              </ul>
            </div>

            <!-- Footer Info -->
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc truy cập trang hỗ trợ của TicketVibe.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 10px; margin-bottom: 0;">
                © 2024 TicketVibe. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Payment confirmation email sent to ${to} (Order #${orderCode})`);
    return true;
  } catch (error) {
    console.error('❌ [EMAIL] Failed to send payment confirmation email:', error);
    console.log(`📧 [EMAIL] Fallback - Payment confirmation for ${to} - Order #${orderCode}`);
    return false;
  }
};

// ============================================
// SEND REFUND EMAIL
// ============================================
interface RefundEmailParams {
  to: string;
  firstName: string;
  eventName: string;
  orderCode: number;
  refundAmount: number;
  reason?: string;
}

export const sendRefundEmail = async ({
  to,
  firstName,
  eventName,
  orderCode,
  refundAmount,
  reason,
}: RefundEmailParams): Promise<boolean> => {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('⚠️  [EMAIL] Email credentials not configured.');
    console.log(`📧 [EMAIL] Would send refund email to ${to} for order ${orderCode}`);
    return false;
  }

  try {
    const mailOptions = {
      from: `"TicketVibe" <${EMAIL_USER}>`,
      to,
      subject: '💰 Hoàn tiền đã được xử lý - TicketVibe',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #a855f7; margin: 0; font-size: 28px;">🎫 TicketVibe</h1>
          </div>

          <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
              <span style="font-size: 32px;">💰</span>
              <h2 style="color: #60a5fa; margin: 0; font-size: 24px;">Hoàn tiền thành công!</h2>
            </div>

            <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
              Xin chào <strong>${firstName}</strong>,
            </p>
            <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
              Yêu cầu hoàn tiền của bạn cho đơn hàng <strong>#${orderCode}</strong> đã được xử lý thành công.
            </p>

            <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #60a5fa;">
              <p style="color: #d1d5db; margin: 0 0 15px 0; font-size: 14px;">
                <strong>Sự kiện:</strong> ${eventName}
              </p>
              <div style="color: #d1d5db; font-size: 14px; line-height: 2;">
                <p style="margin: 0;"><strong>Mã đơn hàng:</strong> #${orderCode}</p>
                <p style="margin: 0;"><strong>Số tiền hoàn lại:</strong> <span style="color: #22c55e; font-weight: bold;">₫${refundAmount.toLocaleString('vi-VN')}</span></p>
                ${reason ? `<p style="margin: 0;"><strong>Lý do:</strong> ${reason}</p>` : ''}
              </div>
            </div>

            <p style="color: #d1d5db; font-size: 14px; line-height: 1.6;">
              Số tiền sẽ được hoàn lại vào tài khoản gốc của bạn trong vòng 3-5 ngày làm việc.
            </p>

            <div style="text-align: center; color: #6b7280; font-size: 12px;">
              <p>© 2024 TicketVibe. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Refund email sent to ${to} (Order #${orderCode})`);
    return true;
  } catch (error) {
    console.error('❌ [EMAIL] Failed to send refund email:', error);
    console.log(`📧 [EMAIL] Fallback - Refund email for ${to} - Order #${orderCode}`);
    return false;
  }
};
