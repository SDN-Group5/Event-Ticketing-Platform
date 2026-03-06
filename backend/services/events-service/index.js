import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './src/config/env.config.js';
import connectMongoDB from './src/config/mongo.config.js';
import cors from 'cors';
import express from 'express';
import eventRoutes from './src/routes/event.routes.js';
import { setIO } from './src/socket.js';

import { engine } from 'express-handlebars';

const app = express();
const port = config.port;

const corsOptions = {
    origin: 'http://localhost:3000',
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

connectMongoDB();
// startSeatCleanupJob(); // Disabled for testing payment-service order cleanup
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
const PORT = process.env.PORT || 4002;

server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    console.log(`🔌 WebSocket ready on same port`);
});