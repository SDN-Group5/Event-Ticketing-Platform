import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://ticketing:ticketing123@localhost:5672';
const EXCHANGE_NAME = 'ticketing.events';
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

            console.log(`[RabbitMQ] Events-service ket noi thanh cong`);

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
                console.error('[RabbitMQ] Het so lan thu. Events-service se chay khong co RabbitMQ.');
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

export async function publishEvent(routingKey, data) {
    if (!channel) {
        console.warn(`[RabbitMQ] Channel chua san sang. Khong gui duoc event: ${routingKey}`);
        return false;
    }

    try {
        const message = Buffer.from(JSON.stringify({
            routingKey,
            data,
            timestamp: new Date().toISOString(),
            source: 'events-service',
        }));

        channel.publish(EXCHANGE_NAME, routingKey, message, {
            persistent: true,
            contentType: 'application/json',
        });

        console.log(`[RabbitMQ] Published: ${routingKey}`, JSON.stringify(data).substring(0, 200));
        return true;
    } catch (err) {
        console.error(`[RabbitMQ] Publish failed (${routingKey}):`, err.message);
        return false;
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
