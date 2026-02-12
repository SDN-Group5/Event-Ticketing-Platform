# Backend - Event Ticketing Platform

## 📁 Cấu trúc (Microservice)

```
backend/
├── services/                    # Các microservice độc lập
│   ├── api-gateway/            # Port 4000 - Cổng vào duy nhất
│   ├── auth-service/           # Port 4001 - Auth & User
│   ├── layout-service/         # Port 4002 - Quản lý sơ đồ/ghế
│   ├── booking-service/        # Port 4003 - (Chưa có)
│   └── payment-service/        # Port 4004 - (Chưa có)
│
├── packages/
│   └── shared/                 # Types & Utils dùng chung
│
└── docker/
    └── docker-compose.yml       # Chạy tất cả services
```

## 🚀 Cách chạy


### Khởi động nhanh với Docker

1. **Cấu hình môi trường**:
   - Chỉnh sửa file `.env` tại thư mục này (`backend/.env`) với thông tin thật của bạn.
   - Chạy script để đồng bộ cấu hình sang các service và Docker:
     ```powershell
     ./setup_env.ps1
     ```

2. **Khởi động**:
   ```bash
   cd docker
   docker compose up -d --build
   ```

3. **Kiểm tra**:
   - **API Gateway**: http://localhost:4000
   - **Auth Service**: http://localhost:4001
   - **Layout Service**: http://localhost:4002

## 📚 Tài liệu

Xem chi tiết tại: `backend/services/BE_docker.md`
