# Troubleshooting: Lỗi tạo banner AI

## Lỗi "Operation not allowed" hoặc 500 Internal Server Error

### Checklist kiểm tra:

#### ✅ 1. Backend đang chạy?
```bash
cd backend
npm run dev
```
Kiểm tra console có log: `✅ Server đang chạy tại cổng: 7002`

---

#### ✅ 2. AWS Credentials đã đúng?
Kiểm tra `backend/.env`:
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

**Lưu ý:** 
- Key phải từ IAM user có quyền Bedrock
- Secret key chỉ hiện 1 lần khi tạo - nếu mất phải tạo key mới

---

#### ✅ 3. Bedrock Model Access đã enable?

1. Vào [AWS Console](https://console.aws.amazon.com/) → **Amazon Bedrock**
2. Chọn region **us-east-1** (N. Virginia)
3. Menu trái → **Model access** (hoặc **Get started** → **Manage model access**)
4. Tìm **Amazon** → **Titan Image Generator G1**
5. Kiểm tra có tick ✅ **Enabled** chưa
6. Nếu chưa → bấm **Enable** → đợi vài phút

---

#### ✅ 4. IAM User có quyền Bedrock?

1. Vào **IAM** → **Users** → chọn user của bạn (vd: `BedrockAPIKey-y475`)
2. Tab **Permissions** → kiểm tra có policy nào không
3. Nếu chưa có → **Add permissions** → **Attach policies directly**
4. Tạo policy mới (JSON):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    }
  ]
}
```

5. Đặt tên: `BedrockInvokeTitan` → **Create**
6. Quay lại user → **Add permissions** → gắn policy vừa tạo

---

#### ✅ 5. Kiểm tra backend logs

Khi gọi API, xem backend console có log lỗi chi tiết không:

```
🔴 AWS Bedrock Error Details: {
  name: 'AccessDeniedException',
  code: '...',
  ...
}
```

**Các lỗi phổ biến:**

| Lỗi | Nguyên nhân | Cách sửa |
|-----|------------|----------|
| `AccessDeniedException` | IAM không có quyền | Thêm policy `bedrock:InvokeModel` |
| `403 Forbidden` | Model chưa enable | Enable Titan Image trong Bedrock Model Access |
| `ValidationException` | Request không hợp lệ | Kiểm tra prompt không quá 512 ký tự |
| `ThrottlingException` | Rate limit | Đợi vài giây rồi thử lại |

---

#### ✅ 6. Test bằng AWS CLI (nếu có)

```bash
aws bedrock-runtime invoke-model \
  --model-id amazon.titan-image-generator-v1 \
  --body '{"taskType":"TEXT_IMAGE","textToImageParams":{"text":"test"},"imageGenerationConfig":{"numberOfImages":1,"height":512,"width":512}}' \
  --region us-east-1 \
  output.json
```

Nếu CLI fail → vấn đề ở AWS config
Nếu CLI OK → vấn đề ở code

---

## Debug Steps

1. **Restart backend** sau khi sửa `.env`
2. **Kiểm tra console logs** khi gọi API
3. **Xem error message chi tiết** trong response
4. **Kiểm tra AWS Console** → Bedrock → Model access
5. **Kiểm tra IAM** → Users → Permissions

---

## Vẫn không được?

1. Copy **toàn bộ error log** từ backend console
2. Kiểm tra **AWS CloudWatch** logs (nếu có)
3. Thử **tạo IAM user mới** với quyền đầy đủ
4. Kiểm tra **billing** - có thể account bị suspend
