# Hướng Dẫn Google OAuth Login

## ⚡ Bắt Đầu Nhanh (2 phút)

1. Truy cập http://localhost:3001/login
2. Nhấp nút "Sign in with Google"
3. Chọn tài khoản Google của bạn
4. Đăng nhập thành công! ✅

---

## 📋 Điều Gì Được Thực Hiện

### Frontend

- ✅ Cài đặt `@react-oauth/google`
- ✅ Thêm `VITE_GOOGLE_CLIENT_ID` vào `.env`
- ✅ Wrap App với `GoogleOAuthProvider`
- ✅ Thêm nút Google login vào `LoginPage`
- ✅ Implement `loginWithGoogle()` trong `AuthContext`

### Backend

- ✅ Endpoint `POST /api/auth/google` sẵn sàng
- ✅ Xác thực token bằng `google-auth-library`
- ✅ Tự động tạo user lần đầu
- ✅ Trả về JWT token

### Environment

```dotenv
# Frontend (.env)
VITE_GOOGLE_CLIENT_ID=722499915288-79titkavhpcuh7a6p8b3225l59frl08v.apps.googleusercontent.com

# Backend (.env)
GOOGLE_CLIENT_ID=722499915288-79titkavhpcuh7a6p8b3225l59frl08v.apps.googleusercontent.com
```

---

## 🧪 Cách Test

### Test 1: Tạo Tài Khoản Mới

```
1. Mở http://localhost:3001/login
2. Nhấp "Sign in with Google"
3. Chọn tài khoản Google của bạn
4. Kiểm tra: tài khoản được tạo trong MongoDB
5. Kỳ vọng: được redirect sang trang chủ (customer)
```

### Test 2: Login Lần 2 (Tài Khoản Cũ)

```
1. Logout từ app
2. Login lại với Google
3. Kiểm tra: không tạo tài khoản mới, reuse account
```

### Test 3: Redirect Theo Role

```
- Customer (default): redirect sang /
- Organizer: redirect sang /organizer
- Admin: redirect sang /admin/payouts
```

### Test 4: Session Persistence

```
1. Login via Google
2. Refresh trang (F5)
3. Kỳ vọng: vẫn đăng nhập, không cần login lại
```

### Test 5: Logout

```
1. Login via Google
2. Nhấp profile → Logout
3. Kiểm tra: localStorage token bị xóa
4. Kỳ vọng: redirect sang login page
```

---

## 📡 Test API (curl)

```bash
# Test endpoint với token hợp lệ
curl -X POST http://localhost:4001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"credential":"YOUR_GOOGLE_ID_TOKEN"}'

# Phản hồi thành công:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f...",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }
}
```

---

## 🐛 Sửa Lỗi

### Nút không hiển thị

- Kiểm tra: `VITE_GOOGLE_CLIENT_ID` có trong `.env` không?
- Refresh trang: Ctrl+Shift+R
- Check console: F12 → Console tab

### Popup bị chặn

- Cho phép popup cho localhost:3001 trong browser settings

### "Google token không hợp lệ"

- Kiểm tra: `GOOGLE_CLIENT_ID` ở backend có khớp không?
- Đảm bảo backend chạy trên port 4001

### "Không thể kết nối server"

- Backend đang chạy chưa?
- Docker: `docker compose up -d` ở thư mục `backend/docker`

### Login thất bại lặng im

- Mở DevTools: F12
- Console tab: xem lỗi gì
- Network tab: kiểm tra POST /api/auth/google return status

---

## 📝 Files Sửa Đổi

| File                                    | Thay Đổi                   |
| --------------------------------------- | -------------------------- |
| `frontend/.env`                         | Thêm VITE_GOOGLE_CLIENT_ID |
| `frontend/package.json`                 | Cài @react-oauth/google    |
| `frontend/src/App.tsx`                  | Thêm GoogleOAuthProvider   |
| `frontend/src/contexts/AuthContext.tsx` | Thêm loginWithGoogle()     |
| `frontend/src/pages/auth/LoginPage.tsx` | Thêm GoogleLogin component |
| `README.md`                             | Cập nhật Google Client ID  |

---

## 🔄 Quy Trình Login

```
User nhấp "Sign in with Google"
    ↓
Google popup mở
    ↓
User chọn tài khoản Google
    ↓
Google trả về ID token (credential)
    ↓
Frontend gửi credential → /api/auth/google
    ↓
Backend xác thực token
    ↓
Check user:
  - Có: cập nhật info
  - Không: tạo user mới
    ↓
Trả về JWT token
    ↓
Frontend lưu token vào localStorage
    ↓
Redirect theo role:
  - admin → /admin/payouts
  - organizer → /organizer
  - customer → /
```

---

## ✅ Kiểm Tra Console (DevTools F12)

### Network Tab

- ✅ POST /api/auth/google returns 200
- ✅ Response có `token` và `user`
- ✅ Không có CORS errors

### Application Tab

- ✅ localStorage có key `auth_token`
- ✅ Token value khớp với response

### Console Tab

- ✅ Không có JavaScript errors
- ✅ Không có warning messages

---

## 🔐 Security Notes

✅ **Bảo mật:**

- ID token xác thực ở backend (không client)
- Credentials không bao giờ expose cho frontend
- JWT token hết hạn sau 1 ngày
- CORS configured cho OAuth callback

---

## 📊 Status

- ✅ Frontend build: thành công
- ✅ Dev server: chạy http://localhost:3001
- ✅ Backend endpoint: sẵn sàng
- ✅ Environment: configured
- ✅ Testing: có thể bắt đầu

**Tất cả sẵn sàng test!** 🚀

---

## 🎯 Tiếp Theo (Optional)

- Apple Sign-In: tương tự Google
- GitHub OAuth: thêm option khác
- Account Linking: link multiple auth methods
- 2FA: two-factor authentication
