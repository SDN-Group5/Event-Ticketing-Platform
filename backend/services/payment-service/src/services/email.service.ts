import axios from 'axios';

const EMAIL_USER = process.env.EMAIL_USER || '';
// Dùng BREVO_API_KEY, nếu không có thì fallback lấy tạm từ biến EMAIL_PASSWORD cũ
const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.EMAIL_PASSWORD || '';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendBrevoEmail = async (payload: any) => {
  if (!BREVO_API_KEY) {
    console.warn('⚠️  [EMAIL] BREVO_API_KEY (hoặc EMAIL_PASSWORD) chưa được cấu hình.');
    return false;
  }

  try {
    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10s timeout
    });
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL API] Failed to send email via Brevo API:', error?.response?.data || error.message);
    return false;
  }
};

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
  if (!EMAIL_USER) {
    console.log(`📧 [EMAIL] Would send payment confirmation to ${to} for order ${orderCode}`);
    return false;
  }

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

  const htmlContent = `
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
            <li style="margin-bottom: 8px;">✓ Bạn sẽ nhận được email thứ hai kèm mã vé QR code</li>
            <li>✓ Truy cập "Vé của tôi" để xem chi tiết vé</li>
          </ul>
        </div>

        <!-- Footer Info -->
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 10px; margin-bottom: 0;">
            © 2024 TicketVibe. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  const payload = {
    sender: { name: "TicketVibe", email: EMAIL_USER },
    to: [{ email: to, name: firstName }],
    subject: "🎉 Đơn hàng thanh toán thành công - TicketVibe",
    htmlContent,
  };

  const isSuccess = await sendBrevoEmail(payload);
  if (isSuccess) {
    console.log(`✅ [EMAIL API] Payment confirmation email sent to ${to} (Order #${orderCode})`);
  }
  return isSuccess;
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
  if (!EMAIL_USER) {
    console.log(`📧 [EMAIL] Would send refund email to ${to} for order ${orderCode}`);
    return false;
  }

  const htmlContent = `
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
          Số tiền sẽ được hoàn trả lại vào tài khoản của bạn thông qua phương thức Voucher hoặc tài khoản gốc.
        </p>
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
          <p>© 2024 TicketVibe. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  const payload = {
    sender: { name: "TicketVibe", email: EMAIL_USER },
    to: [{ email: to, name: firstName }],
    subject: "💰 Hoàn tiền đã được xử lý - TicketVibe",
    htmlContent,
  };

  const isSuccess = await sendBrevoEmail(payload);
  if (isSuccess) {
    console.log(`✅ [EMAIL API] Refund email sent to ${to} (Order #${orderCode})`);
  }
  return isSuccess;
};

// ============================================
// SEND TICKET QR CODE EMAIL
// ============================================
interface TicketQREmailParams {
  to: string;
  firstName: string;
  eventName: string;
  orderCode: number;
  tickets: Array<{
    ticketId: string;
    zoneName: string;
    seatLabel?: string;
    qrCodeBuffer: Buffer; // Buffer for email attachment
  }>;
}

export const sendTicketQREmail = async ({
  to,
  firstName,
  eventName,
  orderCode,
  tickets,
}: TicketQREmailParams): Promise<boolean> => {
  if (!EMAIL_USER) {
    console.log(`📧 [EMAIL] Would send ticket QR email to ${to} for order ${orderCode}`);
    return false;
  }

  // Chuẩn bị danh sách attachment cho Brevo
  const attachments = tickets.map((ticket, idx) => {
    return {
      name: `qr-${ticket.ticketId}.png`,
      content: ticket.qrCodeBuffer.toString('base64'),
    };
  });

  const ticketQRSections = tickets
    .map((ticket, idx) => {
      // Dùng Data URI (Base64 Inline Image) để nhúng trực tiếp QR Code vào HTML
      const base64Img = ticket.qrCodeBuffer.toString('base64');
      const imgSrc = `data:image/png;base64,${base64Img}`;

      return `
        <div style="
          flex: 0 0 calc(50% - 10px);
          margin: 5px;
          padding: 15px;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 12px;
          text-align: center;
          border: 2px solid #a855f7;
        ">
          <p style="color: #a855f7; font-weight: bold; margin: 0 0 10px 0; font-size: 13px;">
            Vé #${idx + 1} - ${ticket.zoneName}
          </p>
          <div style="margin-bottom: 10px;">
            <img src="${imgSrc}" alt="QR Code" style="width: 150px; height: 150px; border-radius: 8px; background: white; padding: 5px;" />
          </div>
          <p style="color: #d1d5db; font-size: 12px; margin: 8px 0 0 0;">
            <strong>${ticket.ticketId}</strong>
          </p>
          ${ticket.seatLabel ? `<p style="color: #9ca3af; font-size: 11px; margin: 4px 0 0 0;">Ghế: ${ticket.seatLabel}</p>` : ''}
        </div>
      `;
    })
    .join('');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #a855f7; margin: 0; font-size: 28px;">🎫 TicketVibe</h1>
      </div>

      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <span style="font-size: 32px;">✨</span>
          <h2 style="color: #22c55e; margin: 0; font-size: 24px;">Vé của bạn đã sẵn sàng!</h2>
        </div>

        <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-top: 0;">
          Xin chào <strong>${firstName}</strong>,
        </p>
        <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
          Dưới đây là mã QR vé của bạn cho sự kiện <strong>${eventName}</strong>. 
          Vui lòng lưu hoặc in mã QR này để xuất trình tại cổng vào sự kiện. Mã QR cũng được đính kèm ở định dạng file hình ảnh PNG trong email này.
        </p>

        <!-- Event Info -->
        <div style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="color: #ffffff; font-size: 14px; margin: 0 0 5px 0; opacity: 0.9;">Sự kiện</p>
          <h3 style="color: #ffffff; margin: 0; font-size: 20px;">${eventName}</h3>
          <p style="color: #ffffff; font-size: 13px; margin: 8px 0 0 0; opacity: 0.9;">Mã đơn: #${orderCode}</p>
        </div>

        <!-- Tickets Grid -->
        <p style="color: #a855f7; font-weight: bold; margin: 25px 0 15px 0; font-size: 14px;">📋 Mã QR vé của bạn</p>
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0; margin-bottom: 20px;">
          ${ticketQRSections}
        </div>

        <!-- Instructions -->
        <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #22c55e; font-weight: bold; margin-top: 0; margin-bottom: 10px;">📱 Hướng dẫn sử dụng</p>
          <ul style="color: #d1d5db; margin: 0; padding-left: 20px; font-size: 14px;">
            <li style="margin-bottom: 8px;">✓ Lưu email này hoặc tải xuống các file đính kèm</li>
            <li style="margin-bottom: 8px;">✓ Đến sự kiện và quét mã QR tại cổng vào</li>
            <li style="margin-bottom: 8px;">✓ Hoặc sử dụng ứng dụng TicketVibe để hiển thị mã QR</li>
            <li>✓ Một vé chỉ có thể quét thành công một lần</li>
          </ul>
        </div>

        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 10px; margin-bottom: 0;">
            © 2024 TicketVibe. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  const payload = {
    sender: { name: "TicketVibe", email: EMAIL_USER },
    to: [{ email: to, name: firstName }],
    subject: "🎫 Mã QR vé của bạn - TicketVibe",
    htmlContent,
    attachment: attachments
  };

  const isSuccess = await sendBrevoEmail(payload);
  if (isSuccess) {
    console.log(`✅ [EMAIL API] Ticket QR email sent to ${to} (Order #${orderCode}) - ${tickets.length} tickets`);
  }
  return isSuccess;
};