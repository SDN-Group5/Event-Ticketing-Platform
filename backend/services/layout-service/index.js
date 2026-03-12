import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './src/config/env.config.js';
import connectMongoDB from './src/config/mongo.config.js';
import cors from 'cors';
import express from 'express';
import indexRoute from './src/routes/index.js';
import { startSeatCleanupJob } from './src/jobs/seatCleanup.js';
import { setIO } from './src/socket.js';
import { connectRabbitMQ } from './src/config/rabbitmq.js'; // import rabiit mq

import { engine } from 'express-handlebars';

const app = express();
const port = config.port;

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
].filter(Boolean);
const isAllowedOrigin = (origin) =>
    !origin || allowedOrigins.includes(origin) || /railway\.app/.test(origin);
const corsOptions = {
    origin: (origin, callback) => {
        callback(null, isAllowedOrigin(origin));
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
    connectRabbitMQ();
});
// startSeatCleanupJob(); // Disabled for testing payment-service order cleanup
indexRoute(app);

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
    console.log(`🪑 ============================================`);
    console.log(`✅ layout-service dang chay tai port: ${port}`);
    console.log(`🐰 RabbitMQ: Event-Driven consumer mode`);
    console.log(`🔌 WebSocket ready on same port`);
    console.log(`🪑 ============================================`);
});