# Kiến trúc Microservice & Triển khai Docker Compose

## Tổng quan kiến trúc

Nền tảng Event Ticketing sử dụng kiến trúc vi dịch vụ với các vai trò:

| Vai trò | Mô tả |
|---------|-------|
| **Nhân viên check-in** | Quản lý check-in tại sự kiện |
| **Admin hệ thống** | Quản trị toàn bộ hệ thống |
| **Nhà tổ chức** | Tạo và quản lý sự kiện |
| **Khách hàng** | Tìm kiếm, mua vé và quản lý vé |

---

## Sơ đồ luồng dữ liệu

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ROLES                                   │
│  Check-in Staff | Admin | Organizer | Customer                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                            │
│  Redux Toolkit / Axios | Web Interface / Mobile Responsive           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 API GATEWAY (Express) - Port 4000                     │
│  /api/auth → Auth    /api/events → Event    /api/payment → Payment   │
│  /api/booking → Booking                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Auth Service  │  │ Event Service │  │Booking Service│  │Payment Service│
│  Port 4001    │  │  Port 4002    │  │  Port 4003    │  │  Port 4004    │
│ Users         │  │Events/Seats   │  │Orders/Tickets │  │ PayOS/Voucher │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │                  │
        └──────────────────┴──────────────────┴──────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB)                           │
│  AuthDB:Users | EventDB:Events/Seats | BookingDB:Orders/Tickets      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│              THIRD-PARTY & ASYNC                                      │
│  PayOS API | Nodemailer/SMTP | Redis (Temporary Lock)                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Chi tiết các dịch vụ

### 1. Auth Service (Port 4001)
- Login, Register, OTP, JWT
- Database: `AuthDB: Users`

### 2. Event Service (Port 4002)
- Seat map, CRUD sự kiện
- Database: `EventDB: Events/Seats`

### 3. Booking Service (Port 4003)
- Giữ ghế (Seat reservation), tạo đơn hàng
- Event: `OrderCreated` → kích hoạt Notification Service
- Database: `BookingDB: Orders/Tickets`

### 4. Payment Service (Port 4004)
- Thanh toán PayOS, quản lý Voucher
- Tích hợp: PayOS API

### 5. Notification Service
- Gửi email vé + QR Code
- Kích hoạt: `Event: OrderCreated`
- Tích hợp: Nodemailer/SMTP

---

## Triển khai với Docker Compose

### Cấu trúc file

```
Event-Ticketing-Platform/
├── docker-compose.yml      # File cấu hình chính
├── .env.example            # Biến môi trường mẫu
├── backend/
├── frontend/
└── doc/
```

### Các service trong Docker Compose

| Service | Port | Mô tả |
|---------|------|-------|
| **frontend** | 3000 | React + Vite |
| **backend** (API Gateway) | 4000 | Express - điểm vào duy nhất |
| **mongodb** | 27017 | MongoDB |
| **redis** | 6379 | Redis (khóa tạm, giữ ghế) |

### Lệnh triển khai

```bash
# 1. Copy file env mẫu (ở thư mục gốc project)
cp .env.example .env

# 2. Chỉnh sửa .env với thông tin thực (JWT_SECRET_KEY, PayOS, Cloudinary...)

# 3. Đảm bảo Docker Desktop đang chạy (MacBook)

# 4. Build và chạy
docker compose up -d --build

# 5. Xem logs
docker compose logs -f

# 6. Dừng
docker compose down
```

### Truy cập ứng dụng

| URL | Mô tả |
|-----|-------|
| http://localhost:3000 | Frontend |
| http://localhost:4000 | Backend API |
| http://localhost:4000/api-docs | Swagger API Docs |

---

## Biến môi trường (.env)

```env
# MongoDB
MONGODB_CONNECTION_STRING=mongodb://mongodb:27017/event_ticketing

# JWT
JWT_SECRET_KEY=your-secret-key

# Frontend URL (cho CORS)
FRONTEND_URL=http://localhost:3000

# PayOS (tùy chọn)
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=

# Cloudinary (tùy chọn)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email/SMTP (tùy chọn)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## Lưu ý quan trọng

1. **Trạng thái hiện tại**: Backend đang chạy dạng **monolith** (một ứng dụng gồm tất cả routes). Để triển khai đầy đủ microservice (Auth, Event, Booking, Payment riêng biệt), cần tách code thành các service độc lập.

2. **Redis**: Dùng cho khóa tạm khi giữ ghế, tránh double-booking.

3. **MongoDB**: Trong Docker dùng hostname `mongodb` thay vì `localhost`.

4. **MacBook**: Cài Docker Desktop trước: https://www.docker.com/products/docker-desktop

---

## Tóm tắt lệnh

| Hành động | Lệnh |
|-----------|------|
| Chạy lần đầu | `docker compose up -d --build` |
| Chạy (đã build) | `docker compose up -d` |
| Xem logs | `docker compose logs -f` |
| Dừng | `docker compose down` |
| Dừng + xóa volumes | `docker compose down -v` |
