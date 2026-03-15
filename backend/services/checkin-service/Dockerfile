# Railway: build context = REPO ROOT.
# Settings: Root Directory = "." (để trống) | Dockerfile path = backend/services/checkin-service/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY backend/services/checkin-service/package*.json ./

RUN npm install

COPY backend/services/checkin-service/ .

RUN npx tsc

ENV NODE_ENV=production
ENV PORT=4005

EXPOSE 4005

CMD ["node", "dist/main.js"]
