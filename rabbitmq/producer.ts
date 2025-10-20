import amqplib from 'amqplib';
import { RabbitMQ_Url } from '../constants';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function connectWithRetry(retries = MAX_RETRIES): Promise<amqplib.Connection> {
  try {
    console.log('Attempting to connect to RabbitMQ at:', RabbitMQ_Url);
    const conn = await amqplib.connect(RabbitMQ_Url) as unknown as amqplib.Connection;
    console.log('Successfully connected to RabbitMQ');
    return conn;
  } catch (err) {
    console.error('RabbitMQ connection error:', err);
    if (retries > 0) {
      console.log(`Failed to connect to RabbitMQ. Retrying in ${RETRY_DELAY/1000} seconds... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries - 1);
    }
    throw err;
  }
}

export async function enqueueDelayedJob(poolId: string, delayMs: number, folderName: string) {
  let conn: amqplib.Connection | null = null;
  let channel: amqplib.Channel | null = null;
  
  try {
    conn = await connectWithRetry();
    channel = await (conn as any).createChannel();
    
    if (!channel) {
      throw new Error('Failed to create channel');
    }
  
    await channel.assertExchange('pool.dlx', 'direct', { durable: true });
  
    await channel.assertQueue('pool.delay', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'pool.dlx',
        'x-dead-letter-routing-key': 'process',
        'x-message-ttl': delayMs,
      }
    });
  
    await channel.assertQueue('pool.process', { durable: true });
  
    const job = { poolId, folderName };
    channel.sendToQueue('pool.delay', Buffer.from(JSON.stringify(job)), { persistent: true });
    console.log(`Delayed job for ${poolId} (${delayMs}ms)`);
  } catch(err) {
    console.error("enqueueDelayedJob error => ", err);
    throw err;
  } finally {
    if (channel) await channel.close();
    if (conn) await (conn as any).close();
  }
}

export async function enqueueAnalysisJob(poolId: string, folderName: string, tokenAddress: string, tokenSymbol: string) {
  console.log("start analysis pool data -------------------", poolId)
  let conn: amqplib.Connection | null = null;
  let channel: amqplib.Channel | null = null;
  
  try {
    conn = await connectWithRetry();
    channel = await (conn as any).createChannel();
    
    if (!channel) {
      throw new Error('Failed to create channel');
    }
  
    await channel.assertExchange('pool.analysis.dlx', 'direct', { durable: true });
  
    await channel.assertQueue('pool.analysis.delay', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'pool.analysis.dlx',
        'x-dead-letter-routing-key': 'analysis',
        'x-message-ttl': 600000, // 10 minutes in milliseconds
      }
    });
  
    await channel.assertQueue('pool.analysis.process', { durable: true });
    await channel.bindQueue('pool.analysis.process', 'pool.analysis.dlx', 'analysis');
  
    const job = { poolId, folderName, tokenAddress, tokenSymbol };
    channel.sendToQueue('pool.analysis.delay', Buffer.from(JSON.stringify(job)), { persistent: true });
    console.log(`Analysis job queued for ${poolId}`);
  } catch(err) {
    console.error("enqueueAnalysisJob error => ", err);
    throw err;
  } finally {
    if (channel) await channel.close();
    if (conn) await (conn as any).close();
  }
}