# Hướng dẫn chạy Backend (Docker)

## 1. Yêu cầu
- Docker Desktop đã được cài đặt và đang chạy.

## 2. Cách chạy
Mở terminal tại thư mục `backend` (thư mục cha của `docker`):

1. **Cấu hình môi trường** (chỉ cần chạy lần đầu hoặc khi đổi `.env`):
   ```powershell
   ./setup_env.ps1
   ```

2. **Khởi động Docker**:
   ```bash
   cd docker
   docker compose up -d
   ```

## 3. Kiểm tra
- **API Gateway**: http://localhost:4000
- **Auth Service**: http://localhost:4001
- **Layout Service**: http://localhost:4002

## 4. Dừng dự án
```bash
docker compose down
```

## 5. Xem log
```bash
docker compose logs -f
```
