import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ưu tiên dùng 1 file chung: backend/.env
// Nếu env đã được inject sẵn (docker/pm2), dotenv sẽ không override.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: false });

const config = {
    port: process.env.EVENTS_SERVICE_PORT || 4002,
    mongoUri:
        process.env.EVENTS_SERVICE_MONGODB_URI ||
        process.env.MONGODB_URI ||
        process.env.MONGODB_CONNECTION_STRING ||
        process.env.MONGODB_ATLAS_URI
};

export default config;