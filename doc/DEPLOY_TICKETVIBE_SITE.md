# @doc Triển khai lên ticketvibe.site

Tài liệu này hướng dẫn bạn triển khai **TicketVibe** lên domain thật `ticketvibe.site` theo cách dễ vận hành nhất:

- **Frontend (Vite build)** chạy sau **Nginx** (serve static).
- **Backend microservices** chạy bằng **Docker Compose** trên VPS.
- **SSL (HTTPS)** bằng **Let’s Encrypt**.
- **Không cần CORS phức tạp**: Nginx proxy `/api` → API Gateway.

> Mục tiêu cuối: mở `https://ticketvibe.site` dùng được, và API health chạy được.

---

## 1) Chuẩn bị (bạn cần có)

- **VPS Ubuntu 22.04/24.04** (khuyến nghị 2 vCPU / 4GB RAM trở lên).
- **Domain**: `ticketvibe.site` (bạn quản lý DNS).
- **MongoDB Atlas** (hoặc MongoDB riêng).
- (Nếu dùng) **PayOS**, **Cloudinary**, **Gmail App Password/SendGrid**.

---

## 2) Quy ước URL production (khuyến nghị)

- **Web**: `https://ticketvibe.site`
- **API**: dùng chung domain qua path:
  - `https://ticketvibe.site/api/...`  → Nginx proxy sang API Gateway

Lợi ích:
- Frontend gọi API bằng đường dẫn tương đối `/api/...` hoặc 1 base URL duy nhất.
- Cookie auth (nếu dùng) dễ chạy hơn, ít lỗi CORS.

---

## 3) Cấu hình DNS cho domain

Trong DNS provider của bạn:

- Tạo bản ghi **A**
  - **Name**: `@`
  - **Value**: `<IP_PUBLIC_VPS>`
- (Tuỳ chọn) thêm `www`
  - **Name**: `www`
  - **Value**: `<IP_PUBLIC_VPS>`

Chờ DNS propagate (thường 5–30 phút).

---

## 4) Setup VPS (Docker + Nginx + Certbot)

SSH vào VPS:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg nginx
```

### Cài Docker Engine + Docker Compose plugin

Làm theo hướng dẫn Docker chính chủ (khuyến nghị). Sau khi xong, kiểm tra:

```bash
docker --version
docker compose version
```

---

## 5) Deploy backend microservices (Docker Compose)

### 5.1. Clone code lên VPS

```bash
cd ~
git clone <repo_git_cua_ban> ticketvibe
cd ticketvibe
```

### 5.2. Tạo file env cho backend

File compose hiện dùng `backend/.env` (vì `docker-compose.yml` có `env_file: ../.env`).

Tạo file:

```bash
cd backend
nano .env
```

Gợi ý tối thiểu (điền giá trị thật):

```env
# MongoDB Atlas
MONGODB_ATLAS_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# JWT
JWT_SECRET_KEY=<random-strong-secret>

# CORS/Redirect (khuyến nghị dùng đúng domain https)
FRONTEND_URL=https://ticketvibe.site

# Email (nếu dùng Gmail SMTP)
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<gmail-app-password-16-chars>

# Cloudinary (nếu dùng upload ảnh)
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>

# PayOS (nếu dùng payment)
PAYOS_CLIENT_ID=<...>
PAYOS_API_KEY=<...>
PAYOS_CHECKSUM_KEY=<...>
PAYOS_ENV=production
```

> Lưu ý: nếu bạn chưa dùng phần nào (PayOS/Cloudinary/Email) thì service liên quan có thể lỗi runtime tuỳ code. Khi triển khai thật, nên cấu hình đủ để test end-to-end.

### 5.3. Chạy docker compose

```bash
cd ~/ticketvibe/backend/docker
docker compose up -d --build
```

### 5.4. Kiểm tra container

```bash
docker compose ps
docker compose logs -f --tail=200
```

---

## 6) Deploy frontend (Vite build) + Nginx

### 6.1. Cấu hình env cho frontend

Trên VPS, tạo:

```bash
cd ~/ticketvibe/frontend
nano .env.production
```

Khuyến nghị:

```env
# Nếu bạn proxy /api qua Nginx cùng domain:
VITE_API_URL=https://ticketvibe.site

# Nếu layout service cần URL riêng, bạn có thể set riêng:
# VITE_LAYOUT_API_URL=https://ticketvibe.site
```

### 6.2. Build frontend

```bash
cd ~/ticketvibe/frontend
npm install
npm run build
```

Sau build, Vite sẽ tạo thư mục `dist/`.

### 6.3. Nginx serve frontend + proxy API

Tạo file config:

```bash
sudo nano /etc/nginx/sites-available/ticketvibe.site
```

Nội dung mẫu:

```nginx
server {
  listen 80;
  server_name ticketvibe.site www.ticketvibe.site;

  # Frontend build output
  root /home/ubuntu/ticketvibe/frontend/dist;
  index index.html;

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Proxy API -> API Gateway
  location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

> Nhớ sửa đường `root` đúng user home trên VPS của bạn (thường là `/home/ubuntu/...` hoặc `/root/...`).

Enable site:

```bash
sudo ln -sf /etc/nginx/sites-available/ticketvibe.site /etc/nginx/sites-enabled/ticketvibe.site
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7) Bật HTTPS (Let’s Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ticketvibe.site -d www.ticketvibe.site
```

Certbot sẽ tự:
- xin SSL
- sửa Nginx để redirect HTTP → HTTPS
- cài auto-renew

Test renew:

```bash
sudo certbot renew --dry-run
```

---

## 8) Tự kiểm tra “đã hoàn thiện chưa” (smoke test)

### 8.1. Kiểm tra web

- Mở `https://ticketvibe.site`
- Refresh bất kỳ route SPA (vd: `/sign-in`) vẫn phải lên (không 404) → nếu 404 nghĩa là thiếu `try_files ... /index.html`.

### 8.2. Kiểm tra API gateway qua domain

Thử gọi 1 endpoint public/nhẹ (tuỳ bạn có endpoint nào sẵn). Ví dụ:

```bash
curl -I https://ticketvibe.site/api/auth/validate-token
```

Nếu API cần cookie/token thì status có thể 401/403 nhưng **không được** 502/504.

### 8.3. Kiểm tra log

```bash
cd ~/ticketvibe/backend/docker
docker compose logs -f --tail=200 api-gateway
```

---

## 9) Lỗi thường gặp (nhanh)

- **502 Bad Gateway** khi gọi `/api/...`
  - API Gateway chưa chạy, hoặc port khác 4000
  - Nginx `proxy_pass` sai
- **Frontend trắng / route con 404**
  - thiếu cấu hình SPA fallback `try_files ... /index.html`
- **Login cookie không lưu**
  - cần HTTPS
  - backend phải set cookie `secure: true` (prod) và `sameSite` phù hợp
- **Backend connect MongoDB fail**
  - Atlas chưa allow IP của VPS (Network Access) hoặc sai connection string

---

## 10) Checklist triển khai (tick)

- [ ] DNS A record `ticketvibe.site` trỏ IP VPS
- [ ] `backend/.env` đã set `MONGODB_ATLAS_URI`, `JWT_SECRET_KEY`, `FRONTEND_URL=https://ticketvibe.site`
- [ ] `docker compose up -d --build` chạy OK, không crash loop
- [ ] `frontend/.env.production` đã set `VITE_API_URL=https://ticketvibe.site`
- [ ] `npm run build` tạo `frontend/dist`
- [ ] Nginx serve được `https://ticketvibe.site`
- [ ] `/api/*` proxy được sang gateway (không 502)

