# AWS Bedrock – Tạo banner sự kiện (Titan Image)

Banner AI trong Create Event dùng **Amazon Bedrock – Titan Image Generator G1**. Key chỉ cấu hình ở **backend** (không đưa key lên frontend).

---

## Bước 1: Request Access cho Titan Image Generator

**⚠️ QUAN TRỌNG:** Titan Image Generator cần được AWS approve trước khi dùng.

### Cách 1: Test qua Playground (Kiểm tra nhanh)

1. Vào [AWS Console](https://console.aws.amazon.com/) → **Amazon Bedrock**
2. Region: **us-east-1** (N. Virginia)
3. Menu trái → **Model catalog** → Tìm **Titan Image Generator G1**
4. Click vào model → Bấm **"Open in playground"**
5. Thử generate ảnh với prompt đơn giản (vd: "concert banner")
6. **Nếu playground hoạt động** → Model đã được enable, vấn đề ở code/config
7. **Nếu playground cũng lỗi "Operation not allowed"** → Cần request access qua Support

### Cách 2: Request qua AWS Support (Nếu playground lỗi)

**Đây là cách chính thức để request access:**

1. Vào [AWS Support Center](https://console.aws.amazon.com/support/home)
2. **Create case** → Chọn **Service limit increase**
3. Điền form:
   - **Service:** Amazon Bedrock
   - **Limit type:** Model access
   - **Region:** us-east-1
   - **Model:** Titan Image Generator G1 (amazon.titan-image-generator-v1)
   - **Use case:** 
     ```
     I need access to Titan Image Generator G1 to generate event banners 
     for my ticketing platform. The banners will be used for promotional 
     purposes on event listing pages. This is for commercial use.
     ```
   - **Requested limit:** 1 (hoặc số lượng bạn cần)
4. **Submit** → AWS sẽ review và approve

**Thời gian chờ:** Thường **4-12 giờ**, có thể lên đến 24-48 giờ.

### Cách 3: Kiểm tra Notifications

1. Bedrock Console → **Settings** (menu trái)
2. Xem có notification nào về model access không
3. Hoặc check email AWS account có email từ AWS về Bedrock approval

---

## Bước 2: Tạo Access Key (IAM)

1. Vào **IAM** → **Users** → chọn user (hoặc tạo user mới).
2. Tab **Security credentials** → **Create access key**.
3. Chọn **Application running outside AWS** → **Next** → **Create**.
4. Copy và lưu lại:
   - **Access key ID**
   - **Secret access key**  
   (Secret chỉ hiện 1 lần.)

---

## Bước 3: Gán quyền Bedrock cho user

User cần quyền gọi Bedrock:

1. IAM → **Users** → chọn user → **Add permissions** → **Attach policies directly**.
2. **Create policy** → JSON, dán:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "*"
    }
  ]
}
```

3. Đặt tên policy (vd: `BedrockInvokeTitan`) → **Create**.
4. Quay lại user → **Add permissions** → gắn policy vừa tạo.

---

## Bước 4: Cấu hình backend

Trong thư mục **backend**, tạo/sửa file `.env`:

```env
# AWS Bedrock – Titan Image (banner)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: lấy từ Bước 2.
- `AWS_REGION`: dùng **us-east-1** (đúng với region đã bật model).

Restart backend sau khi sửa `.env`.

---

## Kiểm tra nhanh

1. Chạy backend: `cd backend && npm run dev`.
2. Chạy frontend: `cd frontend && npm run dev`.
3. Đăng nhập vai **Organizer**.
4. Vào **Create Event** → bước **Content & Media**.
5. Nhập prompt (vd: "Sơn Tùng MTP concert") → **Generate Banner**.

Nếu cấu hình đúng, ảnh sẽ do Titan sinh và hiển thị trong preview.

---

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| Thiếu AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY | Thêm đủ 2 biến vào `backend/.env`. |
| AccessDeniedException | Kiểm tra IAM user đã có policy `bedrock:InvokeModel`. |
| **ValidationException: Operation not allowed** | **Account chưa được approve.** Làm Bước 1 để request access. Đợi AWS approve (1-24h). |
| Model chưa enable | Vào Bedrock → Model catalog → Request access cho Titan Image Generator G1. |
| 403 từ frontend khi gọi backend | Đăng nhập Organizer; kiểm tra CORS backend cho phép origin frontend (vd `http://localhost:3000`). |

---

## ⚡ Đẩy nhanh quá trình approve

**Không thể đẩy nhanh tự động** - AWS phải review thủ công. Nhưng bạn có thể:

1. **Submit request rõ ràng:**
   - Use case cụ thể: "Event banner generation for ticketing platform"
   - Mô tả business need: "Need to generate promotional banners for events"
   - Không spam - chỉ submit 1 lần

2. **Liên hệ AWS Support trực tiếp:**
   - Nếu có AWS Support plan (Business/Enterprise) → có thể request priority
   - Chat/Phone support → giải thích urgent need

3. **Kiểm tra account status:**
   - Đảm bảo account không có restrictions
   - Payment method đã verify
   - Account không bị suspend

**Thời gian thực tế:** Thường **4-12 giờ**, có thể lên đến 24-48 giờ nếu account mới.

---

## Chi phí (tham khảo)

- Titan Image: tính theo ảnh, ~ vài cent/ảnh (xem [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)).
- Chỉ trừ tiền khi gọi API thành công.
