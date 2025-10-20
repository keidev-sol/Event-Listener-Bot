import { bot, sendMessageInTg, startBotPolling } from "./utils";
import { IS_LOCAL, solanaConnection } from "../constants";
import { addThreadByPool } from "../utils";
import axios from 'axios';
import { PublicKey } from "@solana/web3.js";

// Start bot polling
startBotPolling();

console.log("Bot started");

bot.on(`channel_post`, async (msg) => {
  const chatId = msg.chat.id!
  const text = msg.text!
  const msgId = msg.message_id!
  if (text) console.log(`message : ${chatId} -> ${text}`)
  else return
  try {
    let messageText: string

    // Handle /add: commands
    if (text.startsWith('/add:')) {
  const poolAddress = text.replace('/add:', '').trim();

  try {
    const pubkey = new PublicKey(poolAddress);
    // Optional: await pubkey.isOnCurve(); // if you want deeper validation
  } catch (e) {
    console.log("❌ Invalid pool address format:", poolAddress);
    sendMessageInTg(`❌ Invalid address format: ${poolAddress}`);
    return;
  }

  // Get pools already in the queue
  const poolsInQueue = await getRabbitQueuePools();

  // Check if the address already exists
  if (poolsInQueue.some(pool => pool.poolId === poolAddress)) {
    console.log("⚠️ Pool already exists in queue:", poolAddress);
    sendMessageInTg(`⚠️ Pool ${poolAddress} already exists in the queue.`);
    return;
  }

  // Try adding the thread
  const success = await addThreadByPool(solanaConnection, poolAddress);

  if (!success) {
    sendMessageInTg(`❌ Failed to add pool ${poolAddress}. Check if the address is valid.`);
    return;
  }

  // Optionally send confirmation message
  sendMessageInTg(`✅ Pool ${poolAddress} added successfully.`);
}

    if ( msg.chat.type == "channel" && msg.text ) {
      console.log(`📩 Channel message from "${msg.chat.title}": ${msg.text}`);
    }

    switch (text) {
      case `/start`:
        messageText = "Welcome to our Bot"
        sendMessageInTg(messageText)
        break;

      case `/stop`:
        messageText = "Stop Bot"
        sendMessageInTg(messageText)
        break;

      case `/list`:
        try {
          const poolsInQueue = await getRabbitQueuePools();
          if (poolsInQueue.length === 0) {
            messageText = "🟡 No pools currently in monitor.";
            sendMessageInTg(messageText);
            break;
          }

          // Compact Unicode table with inline buttons for copy
          messageText = `<b>🟢 Pools in RabbitMQ queue (${poolsInQueue.length}):</b>\n<pre>`;
          messageText += `┌──┬─────────────┬─────────────┬───────────┬───────┐\n`;
          messageText += `│# │   poolId    │  tokenAddr  │  Symbol   │  DEX  │\n`;
          messageText += `├──┼─────────────┼─────────────┼───────────┼───────┤\n`;
          
          let keyboardRows: any[] = [];

          poolsInQueue.forEach((pool, i) => {
            // Truncate and pad each part to fit the table
            const shortPoolId = (pool.poolId.length > 8 ? `${pool.poolId.slice(0, 3)}..${pool.poolId.slice(-3)}` : pool.poolId).padEnd(8);
            const shortTokenAddr = (pool.tokenAddress.length > 8 ? `${pool.tokenAddress.slice(0, 3)}..${pool.tokenAddress.slice(-3)}` : pool.tokenAddress).padEnd(8);
            const symbol = (pool.tokenSymbol.length > 6 ? `${pool.tokenSymbol.slice(0, 5)}.` : pool.tokenSymbol).padEnd(6);
            const dex = (pool.folderName.length > 4 ? `${pool.folderName.slice(0, 3)}.` : pool.folderName).padEnd(4);
            
            messageText += `│${(i + 1).toString().padEnd(1)} │  ${shortPoolId}   │  ${shortTokenAddr}   │  ${symbol}   │  ${dex} │\n`;

            // Add a row of buttons for each pool
            keyboardRows.push([
                { text: `📋 Pool ${i + 1}`, callback_data: `copy_pool_${i}` },
                { text: `📋 Token ${i + 1}`, callback_data: `copy_token_${i}` }
            ]);
          });
          
          messageText += `└──┴─────────────┴─────────────┴───────────┴───────┘\n`;
          messageText += `</pre>`;

          // Send message with the table and the keyboard
          await bot.sendMessage(msg.chat.id, messageText, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: keyboardRows
            }
          });

        } catch (err) {
          sendMessageInTg("❌ Error fetching queue from RabbitMQ.");
          console.error(err);
        }
        break;
      
      default:
        await bot.deleteMessage(chatId, msgId)
    }
  } catch (e) {
    console.log('error -> \n', e)
  }
});

// Re-add handler for copy buttons
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (!msg || !data) return;

  // Get pools again (can be optimized in a real-world app)
  const poolsInQueue = await getRabbitQueuePools();
  
  const match = data.match(/copy_(pool|token)_(\d+)/);
  if (match) {
    const type = match[1];
    const index = parseInt(match[2], 10);

    if (poolsInQueue[index]) {
      const address = type === 'pool' ? poolsInQueue[index].poolId : poolsInQueue[index].tokenAddress;
      // Answer the callback to remove the "loading" state on the button
      await bot.answerCallbackQuery(callbackQuery.id);
      // Send the address in a new message for easy copying
      await bot.sendMessage(msg.chat.id, `<code>${address}</code>`, { parse_mode: 'HTML' });
    }
  }
});

async function getRabbitQueuePools(): Promise<Array<{ poolId: string, folderName: string, tokenAddress: string, tokenSymbol: string }>> {
  let RABBITMQ_API = 'http://rabbitmq:15672/api/queues/%2F/pool.analysis.delay/get'; // Queue: "pool.process" on vhost "/"
  if( IS_LOCAL ) {
    RABBITMQ_API = 'http://localhost:15672/api/queues/%2F/pool.analysis.delay/get'
  }
  const RABBITMQ_USER = 'user';     
  const RABBITMQ_PASS = 'password'; 

  const data = {
    count: 20,
    ackmode: 'ack_requeue_true', // keeps messages in queue
    encoding: 'auto',
    truncate: 50000
  };

  try {
    const res = await axios.post(RABBITMQ_API, data, {
      auth: {
        username: RABBITMQ_USER,
        password: RABBITMQ_PASS
      },
      headers: { 'content-type': 'application/json' }
    });

    console.log("✅ Received messages:", res.data);

    // Extract all fields
    return res.data.map((msg: any) => {
      try {
        const payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
        return {
          poolId: payload?.poolId || '',
          folderName: payload?.folderName || '',
          tokenAddress: payload?.tokenAddress || '',
          tokenSymbol: payload?.tokenSymbol || ''
        };
      } catch (e) {
        console.warn("⚠️ Failed to parse payload:", msg.payload);
        return { poolId: '', folderName: '', tokenAddress: '', tokenSymbol: '' };
      }
    });

  } catch (error: any) {
    console.error("❌ Error fetching from RabbitMQ:", error.message || error);
    return [];
  }
}


  