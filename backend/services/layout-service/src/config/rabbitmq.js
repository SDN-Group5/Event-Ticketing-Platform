import amqp from 'amqplib';
import mongoose from 'mongoose';
import Seat from '../models/Seat.js';
import EventLayout from '../models/EventLayout.js';
import seatService from '../services/seatService.js';
import { broadcastSeatUpdate } from '../socket.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://ticketing:ticketing123@localhost:5672';
const EXCHANGE_NAME = 'ticketing.events';
const DLQ_EXCHANGE = 'ticketing.dlq';
const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000;
const MAX_CONNECT_RETRIES = 10;

let connection = null;
let channel = null;

export async function connectRabbitMQ() {
    let retries = 0;

    while (retries < MAX_CONNECT_RETRIES) {
        try {
            connection = await amqp.connect(RABBITMQ_URL);
            channel = await connection.createChannel();

            await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
            await channel.assertExchange(DLQ_EXCHANGE, 'topic', { durable: true });

            await channel.prefetch(5);

            await setupConsumers();

            console.log(`[RabbitMQ] Layout-service ket noi thanh cong va dang lang nghe events`);

            connection.on('error', (err) => {
                console.error('[RabbitMQ] Connection error:', err.message);
                reconnect();
            });

            connection.on('close', () => {
                console.warn('[RabbitMQ] Connection closed. Reconnecting...');
                reconnect();
            });

            return;
        } catch (err) {
            retries++;
            console.warn(`[RabbitMQ] Ket noi that bai (lan ${retries}/${MAX_CONNECT_RETRIES}): ${err.message}`);
            if (retries >= MAX_CONNECT_RETRIES) {
                console.error('[RabbitMQ] Het so lan thu. Layout-service se chay khong co RabbitMQ.');
                return;
            }
            await sleep(RETRY_INTERVAL);
        }
    }
}

async function reconnect() {
    channel = null;
    connection = null;
    await sleep(RETRY_INTERVAL);
    await connectRabbitMQ();
}

async function setupConsumers() {
    // Dead Letter Queue - luu message loi sau khi retry het
    const dlqQueue = 'layout.dlq';
    await channel.assertQueue(dlqQueue, { durable: true });
    await channel.bindQueue(dlqQueue, DLQ_EXCHANGE, '#');

    // Consumer 1: seats.mark_sold - Danh dau ghe sold (tu seatPurchase.service)
    await registerConsumer('layout.seats.mark_sold', 'seats.mark_sold', handleMarkSold);

    // Consumer 2: seats.release - Nha ghe ve available (tu seatRelease.service)
    await registerConsumer('layout.seats.release', 'seats.release', handleRelease);

    // Consumer 3: seats.bulk_sold - Bulk danh dau sold (tu webhook PayOS)
    await registerConsumer('layout.seats.bulk_sold', 'seats.bulk_sold', handleBulkSold);

    // Consumer 4: event.created - Tu dong tao blank layout khi co event moi (tu events-service)
    await registerConsumer('layout.event.created', 'event.created', handleEventCreated);

    console.log('[RabbitMQ] 4 consumers da san sang: seats.mark_sold, seats.release, seats.bulk_sold, event.created');
}

async function registerConsumer(queueName, routingKey, handler) {
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, EXCHANGE_NAME, routingKey);

    channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
            const content = JSON.parse(msg.content.toString());
            const eventData = content.data || content;

            console.log(`[RabbitMQ] Nhan event: ${routingKey}`, JSON.stringify(eventData).substring(0, 200));

            await handler(eventData);
            channel.ack(msg);

            console.log(`[RabbitMQ] Xu ly thanh cong: ${routingKey}`);
        } catch (err) {
            console.error(`[RabbitMQ] Loi xu ly ${routingKey}:`, err.message);
            await handleRetry(msg, routingKey);
        }
    });
}

async function handleRetry(msg, routingKey) {
    const headers = msg.properties.headers || {};
    const retryCount = (headers['x-retry-count'] || 0) + 1;

    if (retryCount <= MAX_RETRIES) {
        console.warn(`[RabbitMQ] Retry ${retryCount}/${MAX_RETRIES} cho ${routingKey}`);
        channel.ack(msg);

        await sleep(1000 * retryCount);

        channel.publish(EXCHANGE_NAME, routingKey, msg.content, {
            persistent: true,
            headers: { ...headers, 'x-retry-count': retryCount },
        });
    } else {
        console.error(`[RabbitMQ] DLQ: ${routingKey} that bai sau ${MAX_RETRIES} lan retry`);
        channel.ack(msg);

        channel.publish(DLQ_EXCHANGE, `dlq.${routingKey}`, msg.content, {
            persistent: true,
            headers: { ...headers, 'x-retry-count': retryCount, 'x-original-routing-key': routingKey },
        });
    }
}

// ==================== EVENT HANDLERS ====================

async function handleMarkSold(data) {
    const { eventId, seatIds, bookingId } = data;
    if (!eventId || !seatIds?.length) return;

    const objectIdEventId = new mongoose.Types.ObjectId(eventId);
    const results = [];

    for (const rawSeatId of seatIds) {
        const seat = await findAndUpdateSeat(objectIdEventId, rawSeatId, {
            $set: {
                status: 'sold',
                soldAt: new Date(),
                bookingId: bookingId || null,
                reservationExpiry: null,
            },
            $inc: { version: 1 },
        }, { $ne: 'sold' });

        if (seat) {
            results.push(seat);
            try { await seatService.updateZoneCache(seat.layoutId, seat.zoneId); } catch (_) { }
        }
    }

    if (results.length > 0) {
        broadcastSeatUpdate(eventId, results.map(s => ({
            zoneId: s.zoneId, row: s.row, seatNumber: s.seatNumber,
            status: 'sold',
        })));
    }

    console.log(`[handleMarkSold] Updated ${results.length}/${seatIds.length} seats for event ${eventId}`);
}

async function handleRelease(data) {
    const { eventId, seatIds } = data;
    if (!eventId || !seatIds?.length) return;

    const objectIdEventId = new mongoose.Types.ObjectId(eventId);
    const results = [];

    const releaseUpdate = {
        $set: {
            status: 'available',
            reservedBy: null,
            reservedAt: null,
            reservationExpiry: null,
            soldBy: null,
            soldAt: null,
            bookingId: null,
        },
        $inc: { version: 1 },
    };

    for (const rawSeatId of seatIds) {
        const seat = await findAndUpdateSeat(objectIdEventId, rawSeatId, releaseUpdate, { $in: ['reserved', 'sold'] });

        if (seat) {
            results.push(seat);
            try { await seatService.updateZoneCache(seat.layoutId, seat.zoneId); } catch (_) { }
        }
    }

    if (results.length > 0) {
        broadcastSeatUpdate(eventId, results.map(s => ({
            zoneId: s.zoneId, row: s.row, seatNumber: s.seatNumber,
            status: 'available',
        })));
    }

    console.log(`[handleRelease] Released ${results.length}/${seatIds.length} seats for event ${eventId}`);
}

async function handleBulkSold(data) {
    const { eventId, seatIds, userId, bookingId } = data;
    if (!eventId || !seatIds?.length) return;

    const objectIdEventId = new mongoose.Types.ObjectId(eventId);
    const results = [];

    for (const rawSeatId of seatIds) {
        const seat = await findAndUpdateSeat(objectIdEventId, rawSeatId, {
            $set: {
                status: 'sold',
                soldBy: userId || null,
                soldAt: new Date(),
                ...(bookingId && mongoose.Types.ObjectId.isValid(bookingId) ? { bookingId } : {}),
                reservationExpiry: null,
            },
            $inc: { version: 1 },
        }, { $ne: 'sold' });

        if (seat) {
            results.push(seat);
            try { await seatService.updateZoneCache(seat.layoutId, seat.zoneId); } catch (_) { }
        }
    }

    if (results.length > 0) {
        broadcastSeatUpdate(eventId, results.map(s => ({
            zoneId: s.zoneId, row: s.row, seatNumber: s.seatNumber,
            status: 'sold',
        })));
    }

    console.log(`[handleBulkSold] Marked ${results.length}/${seatIds.length} seats as sold for event ${eventId}`);
}

// handle event với  
async function handleEventCreated(data) {
    const { eventId, eventName, organizerId, canvasWidth, canvasHeight, canvasColor, zones } = data;
    if (!eventId) return;

    const existingLayout = await EventLayout.findOne({ eventId });
    if (existingLayout) {
        console.log(`[handleEventCreated] Layout da ton tai cho event ${eventId}, bo qua.`);
        return;
    }

    const newLayout = new EventLayout({
        eventId,
        eventName: eventName || 'New Event',
        zones: zones || [],
        canvasWidth: canvasWidth || 800,
        canvasHeight: canvasHeight || 600,
        canvasColor: canvasColor || '#1e1a29',
        createdBy: organizerId || null,
        version: 1,
    });

    await newLayout.save();

    const seatZones = newLayout.zones.filter(zone => zone.type === 'seats');
    for (const zone of seatZones) {
        try {
            await seatService.generateSeatsForZone(eventId, newLayout._id, zone);
        } catch (err) {
            console.error(`[handleEventCreated] Loi tao seats cho zone ${zone.name}:`, err.message);
        }
    }

    console.log(`[handleEventCreated] Tao blank layout thanh cong cho event ${eventId}`);
}

// ==================== HELPER ====================

/**
 * Tim va cap nhat seat, ho tro 2 format:
 * 1. MongoDB ObjectId: "69a6df013d5766af133a40a4"
 * 2. Composite key: "zoneId-row-seatNum"
 */
async function findAndUpdateSeat(objectIdEventId, rawSeatId, updateOps, statusFilter) {
    let seat = null;

    if (mongoose.Types.ObjectId.isValid(rawSeatId) && rawSeatId.length === 24) {
        try {
            seat = await Seat.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(rawSeatId), status: statusFilter },
                updateOps,
                { new: true },
            );
        } catch (_) { /* fallthrough to composite strategy */ }
    }

    if (!seat) {
        const parts = String(rawSeatId).split('-');
        if (parts.length >= 3) {
            const seatNumber = parseInt(parts.pop());
            const row = parseInt(parts.pop());
            const zoneId = parts.join('-');

            if (!isNaN(seatNumber) && !isNaN(row)) {
                seat = await Seat.findOneAndUpdate(
                    { eventId: objectIdEventId, zoneId, row, seatNumber, status: statusFilter },
                    updateOps,
                    { new: true },
                );
            }
        }
    }

    return seat;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
