# 📧 Email Setup Guide - Gửi OTP Verification

## Tổng quan
Backend đã tích hợp **Nodemailer** để gửi email OTP 6 số khi user register. Hiện tại dùng **Gmail SMTP**.

## Cách Setup Gmail App Password

### Bước 1: Bật 2-Step Verification
1. Vào [Google Account](https://myaccount.google.com/)
2. Chọn **Security** (Bảo mật)
3. Tìm **2-Step Verification** → Bật nếu chưa bật

### Bước 2: Tạo App Password
1. Vẫn trong **Security**, tìm **App passwords** (Mật khẩu ứng dụng)
2. Chọn app: **Mail**
3. Chọn device: **Other (Custom name)** → Nhập "TicketVibe Backend"
4. Click **Generate**
5. **Copy mật khẩu 16 ký tự** (ví dụ: `abcd efgh ijkl mnop`)

### Bước 3: Thêm vào .env
Mở file `backend/.env` và thêm:

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Lưu ý:**
- `EMAIL_USER`: Email Gmail của bạn (ví dụ: `phuocthde180577@gmail.com`)
- `EMAIL_PASSWORD`: App Password 16 ký tự (bỏ khoảng trắng, ví dụ: `abcdefghijklmnop`)

### Bước 4: Restart Backend
```bash
# Dừng server (Ctrl+C)
# Chạy lại
npm run dev
```

## Kiểm tra

### Nếu setup đúng:
- Khi register, user sẽ nhận email OTP trong hộp thư
- Console backend sẽ hiển thị: `✅ Verification email sent to user@example.com`

### Nếu chưa setup (Dev mode):
- OTP vẫn được log ra console
- Console sẽ hiển thị: `⚠️ [DEV] Email service not configured...`

## Troubleshooting

### Lỗi "Invalid login"
- Kiểm tra lại App Password (phải là 16 ký tự, không có khoảng trắng)
- Đảm bảo đã bật 2-Step Verification

### Lỗi "Less secure app access"
- Gmail không còn hỗ trợ "Less secure apps"
- **Phải dùng App Password** (không dùng mật khẩu Gmail thường)

### Email không đến
- Kiểm tra Spam/Junk folder
- Kiểm tra console backend có lỗi gì không
- Thử resend verification code

## Alternative: Dùng Email Provider khác

Nếu không muốn dùng Gmail, có thể dùng:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **Resend** (free tier: 3,000 emails/month)
- **AWS SES** (pay as you go)

Cần sửa `email.service.ts` để dùng provider khác.
