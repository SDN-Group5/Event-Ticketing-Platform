# Microservices - Event Ticketing Platform

## Cấu trúc thư mục

```
backend/
├── services/                    # Các microservice độc lập
│   ├── api-gateway/             # Cổng vào chính (Port 4000)
│   │   ├── src/
│   │   │   ├── main.ts          # Entry point
│   │   │   ├── routes/          # Proxy routing
│   │   │   └── middleware/      # Error handler
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── auth-service/            # Xác thực & User (Port 4001)
│       ├── src/
│       │   ├── main.ts          # Entry point
│       │   ├── models/          # User schema
│       │   ├── controllers/     # Auth controller
│       │   ├── services/        # Business logic
│       │   ├── routes/          # Auth routes
│       │   └── middleware/      # JWT verify
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/                  # Types & utils dùng chung
│       ├── src/
│       │   ├── types/           # User, Event, Booking types
│       │   └── utils/           # Logger, response helpers
│       └── package.json
│
└── docker/
    ├── docker-compose.yml       # Orchestrate all services
    ├── .env.example             # Environment template
    └── env/                     # Per-service env files
        ├── api-gateway.env
        └── auth.env
```

---

## Cách chạy

### 1. Chạy với Docker Compose (Khuyên dùng)

```bash
# Di chuyển vào thư mục docker
cd backend/docker

# Copy file env mẫu
cp .env.example .env

# Chỉnh sửa .env nếu cần (JWT_SECRET_KEY, etc.)

# Build và chạy
docker compose up -d --build

# Xem logs
docker compose logs -f

# Dừng
docker compose down
```

### 2. Chạy thủ công (Development)

**Terminal 1 - MongoDB:**
```bash
# Nếu dùng Docker
docker run -d -p 27017:27017 --name mongo mongo:7

# Hoặc dùng MongoDB Atlas
```

**Terminal 2 - Auth Service:**
```bash
cd backend/services/auth-service
npm install
npm run dev
# Chạy tại http://localhost:4001
```

**Terminal 3 - API Gateway:**
```bash
cd backend/services/api-gateway
npm install
npm run dev
# Chạy tại http://localhost:4000
```

---

## API Endpoints

### API Gateway (Port 4000)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/health` | Health check |
| * | `/api/auth/*` | Proxy → Auth Service |
| * | `/api/events/*` | Proxy → Event Service (chưa có) |
| * | `/api/bookings/*` | Proxy → Booking Service (chưa có) |
| * | `/api/payments/*` | Proxy → Payment Service (chưa có) |

### Auth Service (Port 4001)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/validate-token` | Xác thực token |
| POST | `/api/auth/change-password` | Đổi mật khẩu (Private) |
| GET | `/api/users/me` | Lấy thông tin user (Private) |
| PATCH | `/api/users/me` | Cập nhật profile (Private) |
| GET | `/api/users` | Danh sách users (Admin) |

---

## Test API

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

### Health Check
```bash
# API Gateway
curl http://localhost:4000/health

# Auth Service (trực tiếp)
curl http://localhost:4001/health
```

---

## Tiếp theo (Roadmap)

- [ ] Event Service (Port 4002) - CRUD sự kiện, sơ đồ ghế
- [ ] Booking Service (Port 4003) - Đặt vé, giữ ghế, vé
- [ ] Payment Service (Port 4004) - PayOS, voucher, refund
- [ ] Notification Service - Email, QR Code
- [ ] Swagger/OpenAPI cho từng service
- [ ] Unit tests & Integration tests
