# Bắt buộc: Root directory trên Railway = backend/services/checkin-service (build context = thư mục này).

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx tsc

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 4005

CMD ["node", "dist/main.js"]
