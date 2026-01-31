# Hướng dẫn Request Titan Image Generator qua AWS Support

## Bước 1: Vào AWS Support Center

1. Vào: https://console.aws.amazon.com/support/home
2. Đảm bảo đang ở region **us-east-1** (N. Virginia)

---

## Bước 2: Tạo Support Case (UI mới)

1. Bấm **"Create case"** (góc trên bên phải)
2. Trong trang "How can we help?" → **Bấm link "Looking for service quota increases?"** (màu xanh, bên phải)
3. Hoặc chọn **"Technical"** → Service: **Amazon Bedrock** → Category: **Service quotas**
4. Điền form:

### Thông tin Case:

**Case type:** Service limit increase

**Service:** 
- Chọn từ dropdown: **Amazon Bedrock**

**Limit type:**
- Chọn: **Model access** hoặc **Other** (nếu không có Model access)

**Region:**
- **us-east-1** (N. Virginia)

**Resource Type:**
- **Titan Image Generator G1** hoặc **amazon.titan-image-generator-v1**

**Request description:**
```
I need access to Amazon Titan Image Generator G1 model for my application.

Use case:
- Generate event banners for a ticketing platform
- Create promotional images for events (concerts, festivals, etc.)
- Commercial use case for event marketing

Model ID: amazon.titan-image-generator-v1
Region: us-east-1

I have already:
- Created IAM user with AmazonBedrockFullAccess policy
- Configured AWS credentials
- Attempted to use the model via API and playground, but received "Operation not allowed" error

Please approve access to Titan Image Generator G1 for my account.
```

**Contact options:**
- **Web** (nhanh nhất) hoặc **Email**

---

## Bước 3: Submit và đợi

1. **Submit case**
2. AWS sẽ gửi email xác nhận
3. **Thời gian chờ:** 4-12 giờ (có thể lên đến 24-48h)

---

## Bước 4: Kiểm tra status

1. Vào Support Center → **My cases**
2. Xem status case
3. Khi approved → AWS sẽ gửi email

---

## Sau khi được approve

1. Test lại playground → phải hoạt động
2. Test lại backend API → phải generate được ảnh
3. Nếu vẫn lỗi → kiểm tra lại IAM permissions và credentials

---

## Lưu ý

- **Không thể đẩy nhanh** - AWS review thủ công
- **Free tier support** cũng có thể tạo case này
- **Business/Enterprise support** có thể request priority (nếu có)
