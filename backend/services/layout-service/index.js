import http from 'http';
import config from './src/config/env.config.js';
import connectMongoDB from './src/config/mongo.config.js';
import cors from 'cors';
import express from 'express';
import indexRoute from './src/routes/index.js';
import { startSeatCleanupJob } from './src/jobs/seatCleanup.js';

import { engine } from 'express-handlebars'; // Import Handlebars

const app = express();
const port = config.port;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Configure Handlebars
app.engine('.hbs', engine({ extname: '.hbs' }));

// Connect to MongoDB
connectMongoDB();

// Start cron jobs
startSeatCleanupJob();

// Use index routes
indexRoute(app);
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});