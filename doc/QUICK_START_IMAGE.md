# ⚡ Quick Start: Tạo Ảnh Từ Prompt (5 Phút)

## 🎯 Cách Nhanh Nhất: Replicate

### Bước 1: Lấy API Token (2 phút)
1. Vào: https://replicate.com/signup
2. Đăng ký bằng email/GitHub
3. Vào: https://replicate.com/account/api-tokens
4. Copy token (bắt đầu bằng `r8_...`)

### Bước 2: Thêm Vào Backend (1 phút)
Mở file `backend/.env` và thêm:
```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
```

### Bước 3: Restart Backend (1 phút)
```bash
cd backend
npm run dev
```

### Bước 4: Test (1 phút)
Gọi API:
```bash
curl -X POST http://localhost:7002/api/ai/generate-banner \
  -H "Content-Type: application/json" \
  -d '{"prompt": "concert banner with stage"}'
```

✅ **Xong!** Bây giờ bạn có thể tạo ảnh từ prompt rồi!

---

## 🔄 Nếu Replicate Lỗi

Hệ thống sẽ **tự động thử** các provider khác:
1. Cloudinary (nếu đã setup)
2. Hugging Face (miễn phí, không cần key)

---

## 📚 Chi Tiết Hơn

Xem file `doc/IMAGE_GENERATION_SETUP.md` để biết:
- Setup các provider khác
- Troubleshooting
- So sánh providers

---

## 💡 Lưu Ý

- **Replicate**: Free 1000 ảnh/tháng
- **Cloudinary**: Free 25 credits/tháng (nếu đã enable AI)
- **Hugging Face**: Unlimited (nhưng chậm hơn)

**Khuyến nghị:** Dùng Replicate cho tốc độ và chất lượng tốt nhất!
