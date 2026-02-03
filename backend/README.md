# Backend - Event Ticketing Platform

## ⚠️ LƯU Ý QUAN TRỌNG

**`backend/src` và `backend/index.ts` đã được xóa** vì đã migration sang kiến trúc microservice.

## 📁 Cấu trúc mới (Microservice)

```
backend/
├── services/                    # Các microservice độc lập
│   ├── api-gateway/            # Port 4000 - Cổng vào duy nhất
│   ├── auth-service/           # Port 4001 - Auth & User
│   ├── event-service/          # Port 4002 - (Chưa có)
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

### Với Docker Compose (Khuyên dùng)

```bash
cd backend/docker
cp .env.example .env
# Điền MONGODB_ATLAS_URI và JWT_SECRET_KEY vào .env
docker compose up -d --build
```

### Chạy thủ công

```bash
# Auth Service
cd backend/services/auth-service
npm install
npm run dev

# API Gateway
cd backend/services/api-gateway
npm install
npm run dev
```

## 📚 Tài liệu

Xem chi tiết tại: `backend/services/README.md`
