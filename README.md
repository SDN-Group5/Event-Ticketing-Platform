# EVENT-TICKETING-PLATFORM

_Your Gateway to Unforgettable Events_

![license](https://img.shields.io/badge/license-ISC-blue)
![last commit](https://img.shields.io/badge/last%20commit-today-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?logo=typescript)
![languages](https://img.shields.io/badge/languages-TypeScript%20%7C%20JavaScript-yellow)

_Built with the tools and technologies:_

![Express](https://img.shields.io/badge/Express-4.18.2-black?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.2.0-green?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8.0.0-red?logo=mongoose)
![Node.js](https://img.shields.io/badge/Node.js-20.9.0-green?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1.1-purple?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38B2AC?logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.11.0-purple?logo=axios)
![PayOS](https://img.shields.io/badge/PayOS-2.0.3-orange?logo=paypal)
![Zustand](https://img.shields.io/badge/Zustand-5.0.9-purple?logo=zustand)
![React Query](https://img.shields.io/badge/React%20Query-5.90.15-orange?logo=react-query)
![Cloudinary](https://img.shields.io/badge/Cloudinary-1.41.0-blue?logo=cloudinary)

---

## 📋 Tổng Quan Dự Án

Hệ thống bán vé sự kiện toàn diện được xây dựng với MERN Stack (MongoDB, Express, React, Node.js) và TypeScript. Hệ thống hỗ trợ quản lý sự kiện từ A-Z với đầy đủ tính năng từ tìm kiếm, đặt vé, thanh toán, check-in đến quản lý tổ chức và phân quyền.

### ✨ Tính Năng Chính

#### 🔐 Xác Thực & Quản Lý Người Dùng

- **Đăng ký/Đăng nhập**: Hỗ trợ Local, Google, Facebook OAuth
- **Quên mật khẩu**: Khôi phục mật khẩu qua OTP/Email
- **Quản lý hồ sơ**: Cập nhật avatar, thông tin cá nhân, đổi mật khẩu
- **Ví số dư**: Quản lý ví, lịch sử giao dịch, rút tiền

#### 🔍 Khám Phá Sự Kiện

- **Tìm kiếm & Lọc**: Tìm sự kiện theo tên, ngày, địa điểm, thể loại (hỗ trợ tìm không dấu)
- **Xem chi tiết**: Thông tin sự kiện, nghệ sĩ, thời gian, sơ đồ ghế
- **Gợi ý cá nhân hóa**: "Có thể bạn thích" dựa trên lịch sử mua vé
- **Xem chỗ ngồi 360 độ**: Mô phỏng góc nhìn thực tế từ ghế (VR/AI)

#### 🎫 Đặt Vé & Thanh Toán

- **Chọn & Giữ ghế**: Khóa ghế trong 5-10 phút khi thanh toán (Race Condition handling)
- **Áp dụng mã giảm giá**: Kiểm tra và trừ tiền theo Voucher
- **Thêm vào yêu thích**: Lưu sự kiện vào Wishlist
- **Thanh toán trực tuyến**: PayOS (Chuyển khoản/QR Code)
- **Xuất vé & QR Code**: Tự động tạo mã QR và gửi qua Email
- **Hủy vé & Hoàn tiền**: Gửi yêu cầu hoàn tiền (trong 36h, phí hủy 40%)
- **Danh sách chờ**: Đăng ký waitlist, nhận thông báo khi có vé trống

#### 🏢 Quản Lý Sự Kiện (Organizer)

- **Tạo sự kiện**: Nhập thông tin, upload ảnh, chọn thời gian
- **Thiết lập sơ đồ ghế**: Cấu hình loại vé, số lượng, vị trí và giá tiền
- **Quản lý Voucher**: Tạo mã giảm giá (% hoặc số tiền cố định)
- **CRUD nhân viên**: Thêm, sửa, xóa, tạo tài khoản cho nhân viên soát vé
- **Gửi thông báo**: Gửi tin nhắn/Email tới Customer hoặc Staff
- **Quản lý đơn hàng**: Theo dõi danh sách khách đã mua vé
- **Xuất danh sách**: Export file Excel danh sách người tham dự
- **Báo cáo & Analytics**: Biểu đồ doanh thu và tỷ lệ lấp đầy ghế
- **Gợi ý giá vé (AI)**: Hệ thống gợi ý mức giá dựa trên dữ liệu lịch sử

#### ✅ Check-in & Xác Thực

- **Đăng nhập nhân viên**: Truy cập hệ thống soát vé (chỉ quyền Check-in)
- **Quét mã QR**: Sử dụng Camera điện thoại để quét vé khách
- **Xác thực & Check-in**: Kiểm tra thật/giả và cập nhật trạng thái vé

#### 👨‍💼 Quản Lý Sàn (Admin)

- **Phê duyệt sự kiện**: Kiểm duyệt nội dung trước khi hiển thị
- **Quản lý người dùng**: Quản lý danh sách Organizer và Customer
- **Đối soát tài chính**: Tính phí sàn (10%) và chuyển tiền cho Organizer
- **Quản lý khiếu nại**: Duyệt hoặc từ chối yêu cầu hoàn tiền
- **Quản lý Banner**: Cấu hình quảng cáo, sự kiện nổi bật trang chủ

#### 🤖 Tự Động Hóa (System)

- **Gửi thông báo tự động**: Cronjob gửi mail nhắc sự kiện trước 1 ngày
- **Thanh toán ký quỹ**: Giữ tiền Resell, giải ngân sau khi check-in thành công

---

## 🏗️ Kiến Trúc Dự Án

```
EVENT-TICKETING-PLATFORM/
├── backend/                 # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── express/         # Express routes, controllers, middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Business logic services
│   │   └── index.ts        # Entry point
│   ├── package.json
│   └── .env
├── frontend/                # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Route pages
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
├── shared/                  # Shared types between frontend & backend
│   └── types.ts
└── README.md
```

---

## 🚀 Bắt Đầu

### Yêu Cầu Hệ Thống

- Node.js >= 18.x
- npm hoặc yarn
- MongoDB (local hoặc MongoDB Atlas)
- Tài khoản Cloudinary (cho upload ảnh)
- Tài khoản PayOS (cho thanh toán)
- Email service (cho gửi OTP, vé QR Code)

### 1. Clone Repository

```bash
git clone <repository-url>
cd Event-Ticketing-Platform
```

### 2. Cài Đặt Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 3. Cấu Hình Environment Variables

#### Backend (.env)

```env
# Database
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/event-ticketing

# JWT
JWT_SECRET_KEY=your-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# PayOS
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key
PAYOS_ENV=sandbox

# Email Service
EMAIL_SERVICE=sendgrid|nodemailer
EMAIL_API_KEY=your-email-api-key
EMAIL_FROM=noreply@eventticketing.com

# OAuth (Configured)
GOOGLE_CLIENT_ID=722499915288-79titkavhpcuh7a6p8b3225l59frl08v.apps.googleusercontent.com
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Server
PORT=7002
FRONTEND_URL=http://localhost:5174
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:4001
VITE_PAYMENT_API_URL=http://localhost:4004
VITE_GOOGLE_CLIENT_ID=722499915288-79titkavhpcuh7a6p8b3225l59frl08v.apps.googleusercontent.com
```

### 4. Chạy Ứng Dụng

#### Backend

```bash
cd backend
npm run dev
```

Server sẽ chạy tại `http://localhost:7002`

#### Frontend

```bash
cd frontend
npm run dev
```

Ứng dụng sẽ mở tại `http://localhost:5174`

---

## 📚 API Documentation

API documentation có sẵn tại `/api-docs` khi chạy backend server.

### 🔐 Web Authentication System (NEW)

The web application now features a **complete authentication system** with real backend integration (no mock data).

**For detailed information, see:**

- 📖 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete navigation guide
- 🚀 **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick start & testing guide
- 📊 **[doc/AUTH_FLOW_DIAGRAMS.md](./doc/AUTH_FLOW_DIAGRAMS.md)** - Flow diagrams
- 📘 **[doc/WEB_AUTH_GUIDE.md](./doc/WEB_AUTH_GUIDE.md)** - Comprehensive guide
- ✅ **[FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** - Complete overview

**Key Features:**

- ✅ User registration with email verification
- ✅ Login/logout with JWT tokens
- ✅ Password reset functionality
- ✅ Session persistence
- ✅ Role-based access control (Customer, Organizer, Admin)
- ✅ Protected routes

**Public Routes:**

- `/` - Homepage (browse events publicly)
- `/search` - Search events
- `/event/:id` - Event details
- `/login` - Login page
- `/register` - Registration page

### Các Endpoint Chính

#### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập (Local/Google/Facebook)
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/verify-email` - Xác thực email bằng OTP
- `POST /api/auth/resend-verification` - Gửi lại mã OTP
- `GET /api/auth/validate-token` - Xác thực token
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/verify-reset-code` - Xác thực mã reset
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

#### User Management

- `GET /api/users/me` - Lấy thông tin user hiện tại
- `PATCH /api/users/me` - Cập nhật hồ sơ
- `PATCH /api/users/me/password` - Đổi mật khẩu
- `GET /api/users/wallet` - Xem ví số dư
- `POST /api/users/wallet/withdraw` - Rút tiền

#### Event Discovery

- `GET /api/events` - Tìm kiếm sự kiện (tên, ngày, địa điểm, thể loại)
- `GET /api/events/:eventId` - Xem chi tiết sự kiện
- `GET /api/events/:eventId/seats` - Xem sơ đồ ghế
- `GET /api/events/recommendations` - Gợi ý cá nhân hóa
- `GET /api/events/:eventId/view-360` - Xem chỗ ngồi 360 độ

#### Booking & Payment

- `POST /api/bookings/reserve-seats` - Chọn & giữ ghế (5-10 phút)
- `POST /api/bookings/apply-voucher` - Áp dụng mã giảm giá
- `POST /api/bookings` - Tạo đơn hàng
- `POST /api/payments/create-payment-intent` - Tạo payment link (PayOS)
- `POST /api/bookings/:bookingId/cancel` - Hủy vé & yêu cầu hoàn tiền
- `POST /api/bookings/waitlist` - Đăng ký danh sách chờ

#### Organizer Management

- `POST /api/organizer/events` - Tạo sự kiện mới
- `GET /api/organizer/events` - Danh sách sự kiện của Organizer
- `PATCH /api/organizer/events/:eventId` - Cập nhật sự kiện
- `POST /api/organizer/events/:eventId/seats` - Thiết lập sơ đồ ghế
- `POST /api/organizer/vouchers` - Tạo Voucher
- `GET /api/organizer/bookings` - Quản lý đơn hàng
- `GET /api/organizer/analytics` - Báo cáo & Analytics
- `POST /api/organizer/notifications` - Gửi thông báo
- `GET /api/organizer/events/:eventId/export` - Xuất danh sách khách (Excel)

#### Check-in App (Staff)

- `POST /api/staff/login` - Đăng nhập nhân viên
- `POST /api/staff/check-in/scan` - Quét mã QR
- `POST /api/staff/check-in/face` - Check-in bằng FaceID
- `GET /api/staff/check-in/:bookingId` - Xác thực vé

#### Admin Management

- `GET /api/admin/events/pending` - Danh sách sự kiện chờ phê duyệt
- `POST /api/admin/events/:eventId/approve` - Phê duyệt sự kiện
- `GET /api/admin/users` - Quản lý người dùng
- `GET /api/admin/financial/reconciliation` - Đối soát tài chính
- `GET /api/admin/complaints` - Quản lý khiếu nại
- `POST /api/admin/complaints/:id/resolve` - Duyệt/từ chối hoàn tiền
- `GET /api/admin/banners` - Quản lý Banner
- `POST /api/admin/banners` - Tạo Banner mới

---

## 🎨 Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **PayOS** - Payment gateway
- **Cloudinary** - Image storage
- **Express Validator** - Input validation
- **Multer** - File upload
- **Nodemailer/SendGrid** - Email service
- **Socket.IO** - Real-time notifications
- **Node-cron** - Scheduled tasks

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **Zustand** - Global state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **React Router** - Routing
- **Lucide React** - Icons
- **QR Code Library** - Generate QR codes
- **Three.js** - 3D seat visualization (360 view)

---

## 👥 Phân Quyền Người Dùng

| Vai Trò              | Quyền Hạn                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Customer**         | Tìm kiếm sự kiện, đặt vé, thanh toán, xem lịch sử mua vé, hủy vé, quản lý ví, đăng ký waitlist, thêm vào yêu thích                                              |
| **Organizer**        | Tạo/quản lý sự kiện, thiết lập sơ đồ ghế, quản lý Voucher, CRUD nhân viên, gửi thông báo, quản lý đơn hàng, xuất danh sách, xem Analytics, nhận gợi ý giá vé AI |
| **Staff (Check-in)** | Đăng nhập hệ thống soát vé, quét mã QR, xác thực vé                                                                                                             |
| **Admin (Sàn)**      | Phê duyệt sự kiện, quản lý người dùng, đối soát tài chính, quản lý khiếu nại, quản lý Banner                                                                    |

---

## 📝 Use Cases (40 Use Cases)

### Module: Admin (Sàn)

1. **UC-37**: Phê duyệt sự kiện
2. **UC-38**: Quản lý người dùng
3. **UC-39**: Đối soát tài chính (Phí sàn 10%)
4. **UC-40**: Quản lý khiếu nại (Duyệt/từ chối hoàn tiền)
5. **UC-41**: Quản lý Banner

### Module: Auth

6. **UC-01**: Đăng ký tài khoản (OTP/Email)
7. **UC-02**: Đăng nhập/Logout (Local, Google, Facebook)
8. **UC-03**: Quên mật khẩu

### Module: User Management

9. **UC-04**: Cập nhật hồ sơ (Avatar, thông tin cá nhân)
10. **UC-05**: Đổi mật khẩu
11. **UC-44**: Quản lý ví số dư

### Module: Discovery

12. **UC-06**: Tìm kiếm & Lọc (Tên, ngày, địa điểm, thể loại - hỗ trợ không dấu)
13. **UC-07**: Xem chi tiết sự kiện
14. **UC-08**: Gợi ý cá nhân hóa
15. **UC-36**: Xem chỗ ngồi 360 độ

### Module: Booking

16. **UC-09**: Chọn & Giữ ghế (Khóa 5-10 phút, Race Condition)
17. **UC-11**: Áp dụng mã giảm giá
18. **UC-12**: Thêm vào yêu thích
19. **UC-15**: Hủy vé & Hoàn tiền (Trong 36h, phí 40%)
20. **UC-16**: Đăng ký danh sách chờ (Waitlist)

### Module: Payment

21. **UC-17**: Thanh toán trực tuyến (PayOS)
22. **UC-18**: Xuất vé & Gửi QR (Email)

### Module: Customer Management

23. **UC-19**: Lịch sử mua vé

### Module: Event View

24. **UC-36**: Xem chỗ ngồi 360 độ

### Module: Organizer

25. **UC-21**: Đăng ký/Đăng nhập Organizer
26. **UC-22**: Tạo mới sự kiện
27. **UC-23**: Thiết lập sơ đồ ghế
28. **UC-24**: Quản lý Voucher
29. **UC-25**: CRUD nhân viên
30. **UC-26**: Gửi thông báo (Global)
31. **UC-27**: Quản lý đơn hàng
32. **UC-28**: Xuất danh sách khách (Excel)
33. **UC-29**: Báo cáo & Analytics
34. **UC-30**: Gợi ý giá vé (AI)

### Module: Check-in App

35. **UC-31**: Đăng nhập nhân viên
36. **UC-32**: Quét mã QR (Scan)
37. **UC-33**: Xác thực & Check-in

### Module: System

38. **UC-42**: Gửi thông báo tự động (Cronjob)
39. **UC-43**: Thanh toán ký quỹ

---

## 🧱 Hướng dẫn thiết kế Microservice cho từng nhóm Use Case

> Mục tiêu: giúp team code theo kiến trúc microservice (Node.js + Express + MongoDB/Mongoose), hiểu **service nào chịu trách nhiệm**, cần **API/collection gì**, và **flow cơ bản** cho từng nhóm UC.

### 1. Phân chia service (logical)

- **API Gateway (4000)**: Route, auth JWT, RBAC, logging, rate limit.
- **Auth-Service (4001)**: UC-01, UC-02, UC-03, UC-04, UC-05, UC-21, UC-31
  - Collections: `users`, `staffs`, `organizers`, `refreshTokens`, `otpTokens`.
- **Event-Service (4002)**: UC-06, UC-07, UC-08, UC-22, UC-23, UC-24, UC-27, UC-28, UC-29, UC-30, UC-36, UC-41
  - Collections: `events`, `seatingPlans`, `vouchers`, `banners`, `analyticsSnapshots`, `priceSuggestions`.
- **Booking-Service (4003)**: UC-09, UC-11, UC-12, UC-15, UC-16, UC-18 (tạo ticket record), UC-19, UC-31–33, UC-36 (map ghế với ticket)
  - Collections: `bookings`, `seatHolds`, `tickets`, `favorites`, `waitlists`, `refundRequests`.
- **Payment-Service (4004)**: UC-17, UC-39, UC-40 (liên quan tiền), UC-42, UC-43, UC-44 (ví)
  - Collections: `wallets`, `transactions`, `payouts`, `escrows`, `paymentIntents`.
- (Tùy chọn) **Notification-Service**: Gửi email/SMS (UC-18, UC-26, UC-42, UC-37/40).

---

### 2. Auth & User (UC-01 → UC-05, UC-21, UC-31, UC-44)

- **Service**: `auth-service`
- **API chính** (đã list ở phần API):
  - `POST /auth/register` (UC-01), `POST /auth/login` (UC-02), `POST /auth/logout`, `POST /auth/forgot-password` (UC-03),
    `PATCH /users/me` (UC-04), `PATCH /users/me/password` (UC-05), `GET /users/wallet` (UC-44), `POST /users/wallet/withdraw`.
- **Flow cơ bản UC-01 (Đăng ký)**:
  1. API Gateway nhận request → check rate limit → forward `POST /auth/register` sang `auth-service`.
  2. `auth-service`:
     - Validate email/password.
     - Hash password với bcrypt.
     - Tạo `user` với trạng thái `PENDING`.
     - Tạo `otpToken` (code + expiredAt) và gửi email (gọi Notification-Service).
  3. API `POST /auth/verify-otp` → set user `ACTIVE`.
- **Flow ví (UC-44)**:
  - `wallets` trong `payment-service`:
    - Schema đơn giản: `userId`, `balance`, `transactions[]`.
    - `GET /wallet` đọc từ `payment-service`.
    - `POST /wallet/withdraw` tạo record `transactions` + enqueue job chuyển tiền thực tế (manual/PayOS).

---

### 3. Discovery & Search (UC-06, UC-07, UC-08, UC-36)

- **Service**: `event-service`
- **Collections**: `events`, `seatingPlans`, `recommendations`.

#### UC-06 – Tìm kiếm & Lọc (có hỗ trợ không dấu)

- **Ý tưởng**:
  - Trong collection `events`, lưu thêm field đã chuẩn hóa không dấu:
    - `name`: "Đêm nhạc Trịnh Công Sơn"
    - `nameNormalized`: "dem nhac trinh cong son"
  - Khi user search `"dem nhac"` hoặc `"dem nhạc"` đều match.
- **Cách code (Node + Mongoose – ý tưởng)**:

```ts
// utils/removeVietnameseTones.ts
export function removeVietnameseTones(str: string) {
  // Có thể dùng thư viện hoặc tự viết map unicode → không dấu
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// models/Event.ts
const EventSchema = new Schema({
  name: String,
  nameNormalized: { type: String, index: true },
  // ... các field khác: date, location, category...
});

EventSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.nameNormalized = removeVietnameseTones(this.name);
  }
  next();
});

// controller search
export const searchEvents = async (req, res) => {
  const { q, date, location, category } = req.query;
  const filter: any = {};
  if (q)
    filter.nameNormalized = {
      $regex: removeVietnameseTones(q as string),
      $options: "i",
    };
  if (date) filter.date = { $gte: startOfDay(date), $lte: endOfDay(date) };
  if (location) filter.location = location;
  if (category) filter.category = category;

  const events = await EventModel.find(filter).limit(50);
  res.json(events);
};
```

#### UC-07 – Xem chi tiết & sơ đồ ghế

- `GET /events/:id` → trả event + thông tin cơ bản.
- `GET /events/:id/seats` → trả `seatingPlan` (rows, cols, zone, price, seatId).

#### UC-08 – Gợi ý cá nhân hóa

- **Service**: `event-service` + đọc dữ liệu `bookings` từ `booking-service`.
- Ý tưởng đơn giản:
  - Lấy top 3 category user hay mua.
  - Recommend các event sắp diễn ra trong category đó, chưa hết vé.

#### UC-36 – Xem chỗ ngồi 360°

- Lưu trong `events`:
  - `view360Config`: `{ seatId, cameraPosition, cameraTarget, assetUrl }`.
- Frontend dùng Three.js hoặc thư viện 3D để render từ data này.

---

### 4. Booking – Giữ ghế, Wishlist, Voucher, Waitlist (UC-09, UC-11, UC-12, UC-15, UC-16)

- **Service**: `booking-service`
- **Collections chính**: `bookings`, `seatHolds`, `favorites`, `vouchers` (share với event-service hoặc riêng), `waitlists`, `refundRequests`.

#### UC-09 – Chọn & Giữ ghế (Race Condition, 5–10 phút)

- **Mục tiêu**:
  - Ghế chỉ có thể được giữ bởi **1 booking** tại 1 thời điểm.
  - Ghế được **tự động nhả** sau 5–10 phút nếu chưa thanh toán.
- **Thiết kế DB**:
  - Collection `seatHolds`:
    - `eventId`, `seatId`, `userId`, `status: "HELD" | "CONFIRMED"`, `expiresAt`.
    - **TTL index** trên `expiresAt` để Mongo tự xóa document hết hạn.
    - **Unique index** trên `eventId + seatId + status in ["HELD", "CONFIRMED"]` để chống double-book.
- **Flow API**:
  1. User chọn ghế → `POST /bookings/reserve-seats`.
  2. `booking-service` mở transaction:
     - Với mỗi seat: `insertOne` vào `seatHolds` với `status = "HELD"`, `expiresAt = now + 10 phút`.
     - Nếu duplicate key error → ghế đã bị giữ/bán → trả lỗi.
  3. Trả về `holdId` + thời gian hết hạn.
  4. Khi user bấm thanh toán:
     - Tạo `booking` với trạng thái `PENDING_PAYMENT`, tham chiếu các `seatHolds`.
     - Gọi `payment-service` tạo `paymentIntent`.
  5. Callback thanh toán thành công → set `seatHolds.status = "CONFIRMED"` và `booking.status = "PAID"`.
  6. Nếu user hủy thanh toán / hết thời gian:
     - Không cập nhật gì, `seatHolds` sẽ tự bị TTL xóa → coi như ghế được nhả.

#### UC-11 – Áp dụng mã giảm giá

- `booking-service` gọi sang `event-service`/`voucher-service`:
  - `GET /vouchers/validate?code=...&eventId=...&userId=...&amount=...`
  - Logic: check hiệu lực, số lần dùng, min-order, loại voucher (%, số tiền).
  - Trả về `discountAmount` để `booking` tính total.

#### UC-12 – Thêm vào yêu thích (Wishlist)

- Collection `favorites`:
  - `userId`, `eventId`, `createdAt`.
- API:
  - `POST /favorites` (add), `DELETE /favorites/:eventId`, `GET /favorites`.

#### UC-15 – Hủy vé & Hoàn tiền (36h, hoàn 60%)

- **Tính phí**:
  - Nếu vé 10k → hoàn 6k → sàn giữ 4k (40%).
- **Flow**:
  1. Customer gọi `POST /bookings/:bookingId/cancel`.
  2. `booking-service`:
     - Check `booking.status === "PAID"` và `createdAt <= now - 36h` (không cho hủy sau 36h).
     - Tạo `refundRequest` với trạng thái `PENDING_ADMIN`.
  3. Admin dùng panel (UC-40) gọi `POST /admin/complaints/:id/resolve`:
     - Nếu `APPROVE`: gửi request sang `payment-service`:
       - Tính `refundAmount = ticketPrice * 0.6`.
       - Ghi `transaction` hoàn tiền (về ví hoặc trả qua PayOS).
       - Update `booking.status = "REFUNDED"`.
     - Nếu `REJECT`: update `refundRequest.status = "REJECTED"`.

#### UC-16 – Danh sách chờ (Waitlist)

- Collection `waitlists`:
  - `eventId`, `userId`, `createdAt`, `status: "WAITING" | "NOTIFIED"`, `maxNotifyCount`.
- **2 trường hợp**:
  1. Event chưa mở bán: user đăng ký waitlist → đến thời điểm mở bán (cron job) → gửi email cho X người đầu tiên.
  2. Event đã sold-out: khi có vé trống lại (do refund/hủy) → trigger job gửi mail cho 1 batch user từ `waitlists`.

---

### 5. Payment – Thanh toán, Ví, Đối soát, Ký quỹ (UC-17, UC-18, UC-39, UC-40, UC-42, UC-43, UC-44)

- **Service**: `payment-service`

#### UC-17 – Thanh toán PayOS

- Flow:
  1. `booking-service` tạo booking (PENDING_PAYMENT) → gọi `POST /payments/create-payment-create`.
  2. `payment-service`:
     - Gọi PayOS API tạo link thanh toán.
     - Lưu `paymentStatus` với `status = "PENDING"`.
  3. User thanh toán xong → PayOS gọi webhook `POST /payments/webhook`.
  4. `payment-service`:
     - Xác minh checksum.
     - Update `paymentStatus.status = "SUCCEEDED"`.
     - Gửi event (REST/kafka/nats) sang `booking-service` để set `booking.status = "PAID"` và `seatHolds` thành `CONFIRMED`.

#### UC-18 – Xuất vé & Gửi QR

- Có thể để trong `booking-service` (tạo ticket) + `notification-service` (gửi email).
- Flow:
  - Khi `booking` chuyển sang `PAID`:
    - Tạo `tickets` (mỗi ghế 1 ticket, có `ticketId`, `qrCodePayload`).
    - Dùng lib QR tạo ảnh → upload Cloudinary → gửi email với link/ảnh QR.

#### UC-39 – Đối soát tài chính (phí sàn 10%)

- Công thức:
  - Với mỗi booking `PAID`:
    - `gross = totalAmount`
    - `platformFee = gross * 0.10`
    - `organizerShare = gross - platformFee`
- Thiết kế:
  - Mỗi `transaction` trong `payment-service` lưu:
    - `bookingId`, `eventId`, `organizerId`, `gross`, `platformFee`, `organizerShare`, `type: "SALE" | "REFUND"`, `status`.
  - API cho Admin:
    - `GET /admin/financial/reconciliation?from=&to=&organizerId=`
      - Group by `organizerId`: sum `gross`, `platformFee`, `organizerShare`, `paidOut`.
  - Khi payout cho Organizer:
    - Tạo record `payouts` + giảm `wallet` của hệ thống (hoặc đánh dấu `PAID_OUT`).

#### UC-40 – Quản lý khiếu nại (liên quan refund)

- Đã mô tả ở UC-15: `refundRequests` nằm trong `booking-service`, nhưng khi duyệt cần gọi `payment-service` để refund tiền.

#### UC-42 – Gửi thông báo tự động

- Cronjob (dùng `node-cron` hoặc service riêng):
  - Mỗi ngày 1 lần:
    - Tìm event sẽ diễn ra trong 24h.
    - Query `bookings` `PAID` cho event đó.
    - Gửi email "Nhắc lịch sự kiện" cho khách.

#### UC-43 – Thanh toán ký quỹ (Escrow)

- Áp dụng cho vé resell hoặc các case cần giữ tiền đến sau check-in.
- Flow:
  1. Trong thanh toán: thay vì chuyển toàn bộ cho Organizer, tiền được đưa vào `escrow`:
     - `escrows`: `bookingId`, `amount`, `status: "HELD" | "RELEASED" | "REFUNDED"`.
  2. Khi check-in thành công (UC-33/35):
     - `booking-service` gửi event sang `payment-service` → `escrow.status = "RELEASED"` → tạo `payout` cho Organizer.
  3. Nếu vé không dùng / bị report:
     - Có thể refund 1 phần/whole tùy rule.

---

### 6. Organizer & Admin (UC-22–30, UC-37–41)

- **Organizer**:
  - Tất cả API `/organizer/...` nên route qua API Gateway → check role `ORGANIZER`.
  - CRUD sự kiện, sơ đồ ghế, voucher, nhân viên, đơn hàng, export Excel, analytics, gợi ý giá vé.
- **Admin**:
  - Phần lớn API ở `admin-service` hoặc tách trong `event-service` + `payment-service`:
    - Approve event (UC-37): set `event.status = "APPROVED"` → mới cho hiển thị ở search.
    - Quản lý user (UC-38): đọc từ `auth-service` + filter role.
    - Đối soát (UC-39): xem từ `payment-service`.
    - Khiếu nại (UC-40): đọc `refundRequests` từ `booking-service`, gọi `payment-service` khi duyệt.
    - Banner (UC-41): CRUD `banners` trong `event-service`.

---

### 7. Gợi ý giá vé (AI) – UC-30

- **Ý tưởng MVP** (chưa cần ML phức tạp):
  - Dựa vào:
    - Loại sự kiện, venue, lịch sử giá vé cũ, tỷ lệ lấp đầy ghế, thời gian còn lại đến ngày diễn.
  - Simple rule:
    - Nếu event cùng loại, cùng venue trước đây có `occupancy > 90%` → gợi ý tăng giá X%.
    - Nếu `occupancy < 50%` ở các lần trước → gợi ý giảm.
- Lưu kết quả vào `priceSuggestions` trong `event-service` để Organizer xem.

---

## 🧪 Testing

### Test API với Postman

Xem hướng dẫn chi tiết tại [backend/TEST_APIS.md](./backend/TEST_APIS.md)

### Test Flow Cơ Bản

1. Đăng ký tài khoản Customer
2. Đăng nhập và lấy token
3. Tìm kiếm sự kiện
4. Chọn ghế và giữ chỗ
5. Áp dụng Voucher (nếu có)
6. Thanh toán qua PayOS
7. Nhận vé QR Code qua Email
8. Check-in tại sự kiện (Staff quét QR)

---

## 📦 Scripts

### Backend

```bash
npm run dev      # Chạy development server
npm run build    # Build TypeScript
npm start        # Chạy production server
```

### Frontend

```bash
npm run dev      # Chạy development server (port 5174)
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Lint code
```

---

## 🔒 Security

- JWT authentication
- Password hashing với bcryptjs
- Input validation với express-validator và Zod
- CORS configuration
- Helmet.js cho security headers
- Rate limiting
- Environment variables cho sensitive data
- QR Code encryption cho vé
- Race Condition handling cho đặt ghế

---

## 📄 License

ISC

---

## 👨‍💻 Author

**Email: de180577tranhongphuoc@gmail.com**
**Facebook: https://www.facebook.com/tran.hong.phuoc.947381/**

---

## 🙏 Acknowledgments

- PayOS - Payment gateway integration
- Cloudinary - Image storage service
- MongoDB Atlas - Cloud database
- React Query - Server state management
- Zustand - State management
- SendGrid/Nodemailer - Email service
- Socket.IO - Real-time notifications

---

_Built with ❤️ using MERN Stack_
