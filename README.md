# EVENT-TICKETING-PLATFORM

*Your Gateway to Unforgettable Events*

![license](https://img.shields.io/badge/license-ISC-blue)
![last commit](https://img.shields.io/badge/last%20commit-today-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?logo=typescript)
![languages](https://img.shields.io/badge/languages-TypeScript%20%7C%20JavaScript-yellow)

*Built with the tools and technologies:*

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
- **Đăng ký khuôn mặt**: Upload ảnh FaceID để chuẩn bị check-in nhanh
- **Check-in khuôn mặt**: Nhận diện khách bằng Camera (FaceID)

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

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Server
PORT=7002
FRONTEND_URL=http://localhost:5174
```

#### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:7002
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

### Các Endpoint Chính

#### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập (Local/Google/Facebook)
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/validate-token` - Xác thực token
- `POST /api/auth/forgot-password` - Quên mật khẩu
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

| Vai Trò | Quyền Hạn |
|---------|-----------|
| **Customer** | Tìm kiếm sự kiện, đặt vé, thanh toán, xem lịch sử mua vé, hủy vé, quản lý ví, đăng ký waitlist, thêm vào yêu thích |
| **Organizer** | Tạo/quản lý sự kiện, thiết lập sơ đồ ghế, quản lý Voucher, CRUD nhân viên, gửi thông báo, quản lý đơn hàng, xuất danh sách, xem Analytics, nhận gợi ý giá vé AI |
| **Staff (Check-in)** | Đăng nhập hệ thống soát vé, quét mã QR, check-in bằng FaceID, xác thực vé |
| **Admin (Sàn)** | Phê duyệt sự kiện, quản lý người dùng, đối soát tài chính, quản lý khiếu nại, quản lý Banner |

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

### Module: Check-in
38. **UC-34**: Đăng ký khuôn mặt
39. **UC-35**: Check-in khuôn mặt

### Module: System
40. **UC-42**: Gửi thông báo tự động (Cronjob)
41. **UC-43**: Thanh toán ký quỹ

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
- FaceID verification cho check-in
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

*Built with ❤️ using MERN Stack*
