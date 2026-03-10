import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './src/config/env.config.js';
import connectMongoDB from './src/config/mongo.config.js';
import cors from 'cors';
import express from 'express';
import eventRoutes from './src/routes/event.routes.js';
import { setIO } from './src/socket.js';
import { startEventCleanupJob } from './src/jobs/eventCleanup.js';

import { engine } from 'express-handlebars';

const app = express();
const port = config.port;

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
].filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || /railway\.app/.test(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.engine('.hbs', engine({ extname: '.hbs' }));

connectMongoDB().then(() => {
    // Kích hoạt job chạy ngầm sau khi DB kết nối thành công
    startEventCleanupJob();
});
eventRoutes(app);

const server = http.createServer(app);

const io = new SocketIOServer(server, { cors: corsOptions });
setIO(io);

io.on('connection', (socket) => {
    socket.on('join-event', (eventId) => {
        socket.join(`event:${eventId}`);
    });

    socket.on('leave-event', (eventId) => {
        socket.leave(`event:${eventId}`);
    });
});
server.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
    console.log(`🔌 WebSocket ready on same port`);
});