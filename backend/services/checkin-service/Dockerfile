# Cách 1 – Context = repo root (Ticket / Railway / Render):
#   Root directory: . (hoặc để trống)
#   Dockerfile path: backend/services/checkin-service/Dockerfile
#   Build arg (nếu có): SVC_PATH=backend/services/checkin-service (đã mặc định)
#
# Cách 2 – Context = thư mục service (build local):
#   cd backend/services/checkin-service
#   docker build --build-arg SVC_PATH=. -t checkin-service .

ARG SVC_PATH=backend/services/checkin-service

FROM node:20-alpine AS builder

WORKDIR /app

COPY ${SVC_PATH}/package*.json ./

RUN npm install

COPY ${SVC_PATH}/ .

RUN npx tsc

FROM node:20-alpine AS runner

WORKDIR /app

COPY ${SVC_PATH}/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 4005

CMD ["node", "dist/main.js"]
