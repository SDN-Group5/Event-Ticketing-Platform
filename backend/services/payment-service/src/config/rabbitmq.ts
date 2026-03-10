import amqp, { ChannelModel, Channel } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://ticketing:ticketing123@localhost:5672';
const EXCHANGE_NAME = 'ticketing.events';
const RETRY_INTERVAL = 5000;
const MAX_CONNECT_RETRIES = 10;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(): Promise<void> {
  let retries = 0;

  while (retries < MAX_CONNECT_RETRIES) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

      console.log(`[RabbitMQ] Ket noi thanh cong: ${RABBITMQ_URL.replace(/\/\/.*@/, '//***@')}`);

      connection.on('error', (err) => {
        console.error('[RabbitMQ] Connection error:', err.message);
        reconnect();
      });

      connection.on('close', () => {
        console.warn('[RabbitMQ] Connection closed. Reconnecting...');
        reconnect();
      });

      return;
    } catch (err: any) {
      retries++;
      console.warn(
        `[RabbitMQ] Ket noi that bai (lan ${retries}/${MAX_CONNECT_RETRIES}): ${err.message}`,
      );
      if (retries >= MAX_CONNECT_RETRIES) {
        console.error('[RabbitMQ] Het so lan thu. Service se chay khong co RabbitMQ.');
        return;
      }
      await sleep(RETRY_INTERVAL);
    }
  }
}

async function reconnect(): Promise<void> {
  channel = null;
  connection = null;
  await sleep(RETRY_INTERVAL);
  await connectRabbitMQ();
}

export async function publishEvent(routingKey: string, data: Record<string, any>): Promise<boolean> {
  if (!channel) {
    console.warn(`[RabbitMQ] Channel chua san sang. Khong gui duoc event: ${routingKey}`);
    return false;
  }

  try {
    const message = Buffer.from(JSON.stringify({
      routingKey,
      data,
      timestamp: new Date().toISOString(),
      source: 'payment-service',
    }));

    channel.publish(EXCHANGE_NAME, routingKey, message, {
      persistent: true,
      contentType: 'application/json',
    });

    console.log(`[RabbitMQ] Published: ${routingKey}`, JSON.stringify(data).substring(0, 200));
    return true;
  } catch (err: any) {
    console.error(`[RabbitMQ] Publish failed (${routingKey}):`, err.message);
    return false;
  }
}

export function getChannel(): Channel | null {
  return channel;
}

export function isConnected(): boolean {
  return channel !== null && connection !== null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
