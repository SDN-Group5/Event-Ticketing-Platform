# Build context = thư mục checkin-service (Root directory trên Ticket/Railway = backend/services/checkin-service).
# Khi build từ repo root: docker build -f backend/services/checkin-service/Dockerfile --build-arg SVC_PATH=backend/services/checkin-service .

ARG SVC_PATH=.

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
