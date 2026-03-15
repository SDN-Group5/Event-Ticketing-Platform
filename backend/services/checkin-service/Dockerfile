# Build context = thư mục checkin-service (docker-compose: context: ../services/checkin-service).
# Railway: set Root Directory = backend/services/checkin-service, Dockerfile = Dockerfile.

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx tsc

ENV NODE_ENV=production
ENV PORT=4005

EXPOSE 4005

CMD ["node", "dist/main.js"]
