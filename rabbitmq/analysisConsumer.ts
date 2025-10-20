import amqplib from 'amqplib';
import { readParquetFile, comparePoolAndSendTg, hasPoolExpired, getParquetSavePath } from '../utils';
import path from 'path';
import fs from 'fs';
import { enqueueAnalysisJob } from './producer';
import { RabbitMQ_Url } from '../constants';

export async function startAnalysisConsumer() {
  try {
    const conn = await amqplib.connect(RabbitMQ_Url);
    const channel = await conn.createChannel();

    await channel.assertExchange('pool.analysis.dlx', 'direct', { durable: true });
    await channel.assertQueue('pool.analysis.process', { durable: true });
    await channel.bindQueue('pool.analysis.process', 'pool.analysis.dlx', 'analysis');

    channel.consume('pool.analysis.process', async (msg) => {
      if (!msg) return;
      const job = JSON.parse(msg.content.toString());
      const poolId = job.poolId;
      const folderName = job.folderName;
      const tokenAddress = job.tokenAddress;
      const tokenSymbol = job.tokenSymbol;

      try {
        const saveDir = getParquetSavePath(folderName);
        const rootDir = path.resolve(__dirname, '..');
        const poolDir = path.join(rootDir, saveDir);
        if (!fs.existsSync(poolDir)) {
          fs.mkdirSync(poolDir, { recursive: true });
        }

        const filePath = path.join(poolDir, `${poolId}.parquet`);

        if (!fs.existsSync(filePath)) return channel.ack(msg);

        let existing = await readParquetFile(filePath); // This should return an array of existing rows
        let latestData = existing[existing.length - 10];
        let newestData = existing[existing.length - 1]


        await comparePoolAndSendTg(latestData, newestData, poolId, folderName);
        console.log("----------finish compare pool data and next step ------------")

        if (!hasPoolExpired(poolId, 24)) {
          await enqueueAnalysisJob(poolId, folderName, tokenAddress, tokenSymbol);   // add analysis queue again
        } else {
          console.log(`Pool ${poolId} expired, not enqueuing further analysis.`);
        }

        console.log(`Analysis completed for pool: ${poolId}`);
      } catch (err) {
        console.error('Analysis consumer error:', err);
      }

      channel.ack(msg);
    });

    console.log('Analysis worker started');
  } catch (err) {
    console.log("startAnalysisConsumer error ==>", err);
  }
} 