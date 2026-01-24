## Auth Plan – TicketVibe

Tài liệu này giúp bạn **theo dõi tiến độ** và **hiểu từng bước** khi xây tính năng Auth cho TicketVibe.
Chia thành 4 khối lớn:
- **Login / Logout**
- **Register**
- **Email Verification**
- **Permission (RBAC – phân quyền)**  

Mỗi phần có:
- **Goal**: mục tiêu
- **Backend**: việc cần làm ở NodeJS + Mongo
- **Frontend**: việc cần làm ở React
- **Tracking**: checklist để tick khi xong


cài thư viện nodemailer
- **npm install nodemailer @types/nodemailer**

---

## 1. Login / Logout

### Goal
- User đăng nhập bằng **email + password**, nhận **JWT token**, lưu vào cookie.
- Logout sẽ **xoá token** (server + client).

### Backend (Express + Mongo)
- **[x] B1 – Schema User**
  - Đảm bảo `User` đã có:
    - `email` (unique)
    - `password` (hash bằng bcrypt)
    - `role` (`customer | organizer | staff | admin`)
- **[x] B2 – Route Login**
  - `POST /api/auth/login`
  - Input: `{ email, password }`
  - Flow:
    - Tìm user theo `email`
    - So sánh `password` (bcrypt.compare)
    - Nếu OK → tạo `JWT` chứa `{ userId, role }`
    - Set cookie: `access_token` (httpOnly, secure trong production)
    - Trả về JSON: `{ id, email, role }`
- **[x] B3 – Route Logout**
  - `POST /api/auth/logout`
  - Xoá cookie `access_token` (res.clearCookie)
  - Trả về `{ message: "Logged out" }`
- **[x] B4 – Middleware verifyToken**
  - Đọc JWT từ cookie
  - Verify và gắn `req.user = { id, role }`

### Frontend (React)
- **[x] F1 – Form Login (đã có)**
  - Sử dụng `react-hook-form` + `zod` (`signInSchema`)
  - Gọi `apiClient.signIn`
  - Lưu user vào `userStore` (id, email, role)
- **[x] F2 – Logout**
  - Nút `Logout` gọi `apiClient.signOut`
  - Clear state ở `userStore`
  - Điều hướng về `/sign-in` hoặc `/`

---

## 2. Register (Sign Up)

### Goal
- User tạo tài khoản mới (mặc định role: **customer**).
- Validate mạnh ở FE + BE.

### Backend
- **[x] B1 – Route Register**
  - `POST /api/auth/register`
  - Input (ví dụ): `{ firstName, lastName, email, password }`
  - Flow:
    - Check email đã tồn tại chưa
    - Hash password
    - Tạo user với `role: "customer"`
    - Yêu cầu verify email trước (phần 3)
- **[x] B2 – Validate**
  - Kiểm tra độ dài password, format email, v.v.
  - Trả về lỗi rõ ràng cho FE.

### Frontend
- **[x] F1 – Register Form (đã dựng UI TicketVibe)**
  - Dùng `registerSchema` (Zod) cho:
    - `firstName`, `lastName`, `email`, `password`, `confirmPassword`
  - Show error message dưới mỗi field.
- **[x] F2 – Gọi API**
  - Gọi `apiClient.register(data)`
  - Yêu cầu verify email:
    - Điều hướng sang **Email Verification** page (phần 3).

---

## 3. Email Verification (Xác thực email)

### Goal
- Sau khi đăng ký, user cần nhập **mã 6 số** gửi qua email để **kích hoạt** tài khoản.
- Chỉ user đã verify mới login thành công (tuỳ policy).

### Backend
- **[x] B1 – Thêm field trên User**
  - `emailVerified: boolean` (default: false)
  - `emailVerificationCode: string | null`
  - `emailVerificationExpires: Date | null`
- **[x] B2 – Tạo + gửi code**
  - Sau `POST /api/auth/register`:
    - Tạo mã 6 số (random)
    - Lưu `emailVerificationCode` + `emailVerificationExpires` (VD: +15 phút)
    - Gửi email cho user qua Nodemailer (Gmail SMTP).
- **[x] B3 – API verify code**
  - `POST /api/auth/verify-email`
  - Input: `{ email, code }`
  - Flow:
    - Tìm user theo `email`
    - Check:
      - Code khớp với `emailVerificationCode`
      - Chưa hết hạn
    - Nếu OK:
      - Set `emailVerified = true`
      - Xoá code + expires
- **[x] B4 – Logic Login check verify**
  - Trong `/login`, nếu policy yêu cầu:
    - Nếu `!user.emailVerified` → trả lỗi:
      - `403` + message: "Email chưa xác thực"

### Frontend
- **[x] F1 – Page `Verify Email` (UI giống design bạn gửi)**
  - Route: `/verify-email`
  - State cần:
    - `email` (truyền từ trang Register, hoặc đọc từ URL query)
    - `code` (6 ô input)
  - Nút `Verify & Proceed`:
    - Gọi `POST /api/auth/verify-email`
    - Nếu OK → toast success + điều hướng `/sign-in`
- **[x] F2 – Resend code**
  - Nút `Resend Code`:
    - Gọi `POST /api/auth/resend-verification`
    - Backend tạo code mới, gửi lại email.
- **[x] F3 – UX nhỏ**
  - Countdown (59s) cho resend.
  - Tự nhảy focus giữa các ô OTP.

---

## 4. Permission / RBAC (Role-Based Access Control)

### Goal
- Dùng 4 role:
  - **customer** – mua vé, xem lịch sử, quản lý ví, v.v.
  - **organizer** – tạo/quản lý event, voucher, staff, analytics
  - **staff** – check-in, scan QR, xác thực vé
  - **admin** – phê duyệt event, quản lý user, đối soát tài chính…
- Mỗi API protected đều check **auth + role**.

### Backend
- **[x] B1 – Role trên User (đã có)**
  - Enum: `customer | organizer | staff | admin`
- **[x] B2 – Middleware `roleCheck(...allowedRoles)`**
  - Ví dụ:
    - `/api/admin/*` → `roleCheck(["admin"])`
    - `/api/organizer/*` → `roleCheck(["organizer"])`
    - `/api/staff/*` → `roleCheck(["staff"])`
    - `/api/customer/*` → `roleCheck(["customer"])`
- **[x] B3 – Mapping quyền (tối thiểu)**
  - Customer:
    - Routes: `/api/customer/orders`, `/api/customer/tickets`, `/api/customer/wallet`, `/api/customer/favorites`
  - Organizer:
    - Routes: `/api/organizer/events`, `/api/organizer/vouchers`, `/api/organizer/staff`, `/api/organizer/analytics`
  - Staff:
    - Routes: `/api/staff/checkin`, `/api/staff/scan-qr`, `/api/staff/verify-ticket`
  - Admin:
    - Routes: `/api/admin/users`, `/api/admin/events/approve`, `/api/admin/finance/reports`
    - User management: `/api/users` (GET, PATCH, DELETE) - chỉ admin

### Frontend
- **[x] F1 – Lưu role trong `userStore`**
  - `currentUser.role`
  - Helper: `isCustomer()`, `isOrganizer()`, `isStaff()`, `isAdmin()`.
- **[x] F2 – ProtectedRoute theo role**
  - Ví dụ:
    - `/dashboard/organizer/*` → chỉ `organizer`
    - `/dashboard/staff/*` → chỉ `staff`
    - `/dashboard/admin/*` → chỉ `admin`
- **[x] F3 – Ẩn/hiện UI**
  - Navbar: Hiển thị "My Tickets" cho customer, "Dashboard" links theo role
  - Sidebar: (TODO - cần tạo Sidebar mới cho Event Ticketing Platform)
  - Buttons: Render theo role trong các components

---

## 5. Forget Password / Reset Password

### Goal
- User quên mật khẩu có thể yêu cầu reset qua email.
- Nhận mã OTP 6 số hoặc link reset (tuỳ chọn).
- Đặt lại mật khẩu mới.

### Backend
- **[ ] B1 – Thêm field trên User**
  - `passwordResetCode: string | null`
  - `passwordResetExpires: Date | null`
- **[ ] B2 – API Request Reset Password**
  - `POST /api/auth/forgot-password`
  - Input: `{ email }`
  - Flow:
    - Tìm user theo `email`
    - Tạo mã 6 số (random) hoặc token
    - Lưu `passwordResetCode` + `passwordResetExpires` (VD: +15 phút)
    - Gửi email chứa mã OTP hoặc link reset
    - Trả về: `{ message: "Mã reset đã được gửi đến email" }`
- **[ ] B3 – API Verify Reset Code**
  - `POST /api/auth/verify-reset-code`
  - Input: `{ email, code }`
  - Flow:
    - Tìm user theo `email`
    - Check code khớp và chưa hết hạn
    - Trả về: `{ message: "Code hợp lệ", token: "resetToken" }` (hoặc chỉ success)
- **[ ] B4 – API Reset Password**
  - `POST /api/auth/reset-password`
  - Input: `{ email, code, newPassword }` (hoặc `{ token, newPassword }`)
  - Flow:
    - Verify code/token
    - Hash password mới
    - Update `user.password`
    - Xoá `passwordResetCode` + `passwordResetExpires`
    - Trả về: `{ message: "Đặt lại mật khẩu thành công" }`

### Frontend
- **[ ] F1 – Page Forgot Password**
  - Route: `/forgot-password`
  - Form: Input `email`
  - Nút "Gửi mã reset"
  - Gọi `POST /api/auth/forgot-password`
- **[ ] F2 – Page Reset Password**
  - Route: `/reset-password`
  - Form: Input `email`, `code` (6 số), `newPassword`, `confirmPassword`
  - Nút "Đặt lại mật khẩu"
  - Gọi `POST /api/auth/reset-password`
- **[ ] F3 – UX**
  - Link "Quên mật khẩu?" ở trang Sign In
  - Countdown resend code
  - Validation password mới (giống register)

---

## 6. Tracking tổng quan

### Phase 1 – Core Auth ✅
- [x] Login / Logout backend
- [x] Login / Logout frontend

### Phase 2 – Register ✅
- [x] Register backend
- [x] Register UI TicketVibe (đã dựng)
- [x] Kết nối Register UI ↔ API

### Phase 3 – Email Verification ✅
- [x] Thêm field verify vào User
- [x] API gửi / verify code
- [x] Page Verify Email + resend
- [x] Chặn login khi chưa verify (nếu cần)

### Phase 4 – Permissions / RBAC ✅ (Hoàn thành cơ bản)
- [x] Middleware roleCheck
- [x] Áp dụng vào các route chính (admin, organizer, staff, customer)
- [x] ProtectedRoute + ẩn/hiện UI theo role (Navbar)
- [ ] Sidebar mới cho Event Ticketing Platform (thay thế Sidebar cũ của hotel booking)

### Phase 5 – Forget Password ✅ (Hoàn thành)
- [x] Thêm field reset vào User (passwordResetCode, passwordResetExpires)
- [x] API forgot-password / verify-reset-code / reset-password
- [x] Email service gửi reset password code
- [x] Page Forgot Password + Reset Password
- [x] Link từ Sign In page

Khi bạn bắt đầu implement từng phần, cứ mở file này và tick dần các bước để **theo dõi tiến độ** và dễ hiểu flow toàn hệ thống Auth.

