import amqplib from 'amqplib';
import { writeParquetFile, readParquetFile, enrichPumpswapPool, enrichLaunchpadPool, enrichBelievePool, enrichMoonitDynPool, enrichMoonitRaydiumPool, enrichLaunchpadAmmPool, getParquetSavePath } from '../utils';
import { SCHEMA } from '../type';
import path from 'path';
import fs from 'fs';
import { CHECK_INTERVAL, RabbitMQ_Url } from '../constants';
import Docker from 'dockerode'
import { enrichPoolData } from '../utils/ether';


export async function startConsumer() {
  try {
    const docker = new Docker();
    const containers = await docker.listContainers({ all: true });
    console.log({ containers }, " containers found");
    containers
      .filter(c => c.Labels?.role === 'worker')
      .forEach(c => {
        console.log(`${c.Names[0]} → ${c.State}`);
      });

    const conn = await amqplib.connect(RabbitMQ_Url);
    const channel = await conn.createChannel();

    await channel.assertExchange('pool.dlx', 'direct', { durable: true });
    await channel.assertQueue('pool.process', { durable: true });
    let questate = await channel.bindQueue('pool.process', 'pool.dlx', 'process');

    let que = channel.consume('pool.process', async (msg) => {
      if (!msg) return;
      const job = JSON.parse(msg.content.toString());
      const poolId = job.poolId;
      const folderName = job.folderName;

      try {
        console.log("start consumer ")
        const saveDir = getParquetSavePath(folderName);
        const rootDir = path.resolve(__dirname, '..');
        const poolDir = path.join(rootDir, saveDir);
        if (!fs.existsSync(poolDir)) {
          fs.mkdirSync(poolDir, { recursive: true });
        }

        const filePath = path.join(poolDir, `${poolId}.parquet`);

        if (!fs.existsSync(filePath)) return channel.ack(msg);

        let existing = await readParquetFile(filePath); // This should return an array of existing rows
        let latest = existing[existing.length - 1];

        let enriched;
        console.log("folder name ==> ", folderName)
        if (folderName == "PumpSwap") {
          const result = await enrichPumpswapPool(latest, poolId);
          console.log("result pumpSwap ==>", result)
          enriched = result.poolData;
        } else if (folderName == "RaydiumLaunchpad") {
          if (poolId.split("_")[1] == "CPMM") {
            let pool_id = poolId.split("_")[0]
            const result = await enrichLaunchpadPool(latest, pool_id);
            enriched = result.poolData;
          }
          if (poolId.split("_")[1] == "AMM") {
            let pool_id = poolId.split("_")[0]
            enriched = await enrichLaunchpadAmmPool(latest, pool_id);
          }
        } else if (folderName == "Bonk") {
          console.log("Bonk start")
          const result = await enrichLaunchpadPool(latest, poolId);
          console.log("result Bonk ==> ", result)
          enriched = result.poolData;
        } else if (folderName == "Believe") {
          console.log("beieve start")
          const result = await enrichBelievePool(latest, poolId);
          enriched = result.poolData;
        } else if (folderName == "Moonit") {
          if (poolId.split("_")[1] == "DYN") {
            let pool_id = poolId.split("_")[0]
            const result = await enrichMoonitDynPool(latest, pool_id);
            enriched = result.poolData;
          }
          if (poolId.split("_")[1] == "RAY") {
            let pool_id = poolId.split("_")[0]
            enriched = await enrichMoonitRaydiumPool(latest, pool_id);
          }
        } else if (folderName == "Boop") {
          const result = await enrichLaunchpadPool(latest, poolId);
          enriched = result.poolData;
        } else if (folderName == "VirtualBase") {
          const result = await enrichPoolData(latest, poolId, folderName);
          enriched = result.poolData;
        } else if ( folderName == "ArenaTrade" ) {
          const result = await enrichPoolData(latest, poolId, folderName)
          enriched = result.poolData
        }
        await writeParquetFile(enriched, SCHEMA, poolId, folderName);

        const { enqueueDelayedJob } = await import('./producer');
        await enqueueDelayedJob(poolId, CHECK_INTERVAL, folderName);

        console.log(`Updated pool: ${poolId}`);
      } catch (err) {
        console.error('Consumer error:', err);
      }

      channel.ack(msg);
    });

    console.log('Worker started');
  } catch (err) {
    console.log("startConsumer error ==>", err)
  }

}

startConsumer();
