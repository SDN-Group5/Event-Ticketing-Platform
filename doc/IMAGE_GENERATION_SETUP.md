# 🎨 Hướng Dẫn Setup Image Generation (Tạo Ảnh Từ Prompt)

## 📖 Tổng Quan

Dự án hỗ trợ **4 provider** để tạo ảnh banner từ prompt:
1. **Replicate** (Khuyến nghị - Dễ setup nhất) ⭐
2. **Cloudinary AI** (Nếu đã có account Cloudinary)
3. **Hugging Face** (Miễn phí, không cần API key)
4. **AWS Bedrock** (Cần approval từ AWS)

Hệ thống sẽ **tự động fallback** giữa các provider nếu một provider lỗi.

---

## 🚀 Option 1: Replicate (Khuyến Nghị)

### ✅ Ưu điểm:
- Dễ setup nhất
- Free tier: 1000 ảnh/tháng
- Không cần approval
- Chất lượng tốt (Stable Diffusion XL)

### 📝 Cách Setup:

1. **Tạo tài khoản:**
   - Truy cập: https://replicate.com/signup
   - Đăng ký bằng email/GitHub

2. **Lấy API Token:**
   - Vào: https://replicate.com/account/api-tokens
   - Copy token (bắt đầu bằng `r8_...`)

3. **Thêm vào `.env`:**
   ```env
   REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
   ```

4. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

✅ **Xong!** Backend sẽ tự động dùng Replicate khi gọi API.

---

## ☁️ Option 2: Cloudinary AI

### ✅ Ưu điểm:
- Nếu đã có account Cloudinary (đã setup cho upload ảnh)
- Free tier: 25 credits/tháng

### 📝 Cách Setup:

1. **Kiểm tra đã có Cloudinary chưa:**
   - Xem file `backend/.env` có `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` chưa
   - Nếu chưa → xem `doc/cloud/CLOUDINARY_SETUP.md`

2. **Enable AI Image Generation:**
   - Vào: https://console.cloudinary.com/
   - Menu **Add-ons** → Tìm **AI Image Generation**
   - Bấm **Enable** (miễn phí 25 credits/tháng)

3. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

✅ **Xong!** Nếu Replicate lỗi, hệ thống sẽ tự động dùng Cloudinary.

---

## 🤗 Option 3: Hugging Face (Miễn Phí)

### ✅ Ưu điểm:
- Hoàn toàn miễn phí
- Không cần API key (nhưng có thì tốt hơn)

### 📝 Cách Setup:

**Không cần setup gì!** Hệ thống sẽ tự động dùng Hugging Face nếu các provider khác lỗi.

**Tùy chọn:** Nếu muốn tốt hơn, lấy API key:
1. Vào: https://huggingface.co/settings/tokens
2. Tạo token mới (read permission)
3. Thêm vào `.env`:
   ```env
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
   ```

---

## ☁️ Option 4: AWS Bedrock (Nếu Đã Setup)

Nếu bạn đã setup AWS Bedrock (xem `doc/AWS_BEDROCK_SETUP.md`), có thể chỉ định provider:

```javascript
// Frontend
const result = await generateEventBanner({
  prompt: "concert banner",
  eventName: "Blackpink Concert",
  provider: "bedrock" // Chỉ định Bedrock
});
```

---

## 🧪 Test API

### 1. Test bằng Postman/Thunder Client:

```http
POST http://localhost:7002/api/ai/generate-banner
Content-Type: application/json

{
  "prompt": "concert banner with stage and lights",
  "eventName": "Blackpink World Tour"
}
```

**Response:**
```json
{
  "imageDataUrl": "data:image/png;base64,iVBORw0KG...",
  "provider": "replicate"
}
```

### 2. Test từ Frontend:

```typescript
import { generateEventBanner } from '@/services/aiContentService';

const imageUrl = await generateEventBanner({
  prompt: "concert banner",
  eventName: "My Event"
});
// imageUrl = "data:image/png;base64,..."
```

---

## 🔄 Fallback Mechanism

Hệ thống tự động thử các provider theo thứ tự:

1. **Replicate** (nếu có `REPLICATE_API_TOKEN`)
2. **Cloudinary** (nếu có `CLOUDINARY_*` và đã enable AI)
3. **Hugging Face** (luôn có, không cần key)

**Ví dụ:**
- Nếu Replicate lỗi → tự động thử Cloudinary
- Nếu Cloudinary lỗi → tự động thử Hugging Face
- Nếu tất cả lỗi → trả về error message chi tiết

---

## ❌ Troubleshooting

### Lỗi: "Tất cả providers đều lỗi"

**Kiểm tra:**
1. ✅ Backend đang chạy?
2. ✅ Có ít nhất 1 API key trong `.env`?
3. ✅ Đã restart backend sau khi sửa `.env`?

**Giải pháp:**
- Setup Replicate (dễ nhất) → xem Option 1
- Hoặc dùng Hugging Face (không cần key) → tự động fallback

### Lỗi: "Replicate API lỗi: 401"

**Nguyên nhân:** API token sai hoặc hết hạn  
**Giải pháp:** Tạo token mới tại https://replicate.com/account/api-tokens

### Lỗi: "Cloudinary AI lỗi: 403"

**Nguyên nhân:** Chưa enable AI Image Generation  
**Giải pháp:** Vào Cloudinary Console → Add-ons → Enable AI Image Generation

### Lỗi: "Hugging Face API lỗi: 503"

**Nguyên nhân:** Model đang loading (bình thường)  
**Giải pháp:** Hệ thống tự động retry sau 10 giây

---

## 📊 So Sánh Providers

| Provider | Free Tier | Setup | Chất Lượng | Tốc Độ |
|----------|-----------|-------|------------|--------|
| **Replicate** | 1000/tháng | ⭐⭐⭐ Rất dễ | ⭐⭐⭐⭐⭐ Tốt | ⭐⭐⭐⭐ Nhanh |
| **Cloudinary** | 25/tháng | ⭐⭐⭐ Dễ | ⭐⭐⭐⭐ Khá | ⭐⭐⭐ Trung bình |
| **Hugging Face** | Unlimited | ⭐⭐⭐⭐⭐ Không cần | ⭐⭐⭐ Trung bình | ⭐⭐ Chậm |
| **AWS Bedrock** | Pay-as-you-go | ⭐ Khó | ⭐⭐⭐⭐⭐ Tốt | ⭐⭐⭐⭐ Nhanh |

---

## ✅ Checklist

- [ ] Đã chọn provider (khuyến nghị: Replicate)
- [ ] Đã lấy API token/key
- [ ] Đã thêm vào `backend/.env`
- [ ] Đã restart backend
- [ ] Đã test API thành công

---

## 🎉 Xong!

Bây giờ bạn có thể tạo ảnh banner từ prompt rồi! Hệ thống sẽ tự động chọn provider tốt nhất.

**Lưu ý:** Nếu cần gấp, setup **Replicate** (5 phút) hoặc dùng **Hugging Face** (không cần setup).
