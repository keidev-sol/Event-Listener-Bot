# 🧪 Event Listener Bot

Multi-chain Liquidity Migration Tracker for Solana & EVM Networks

## 📄 Summary

Event Listener Bot is a production-grade blockchain event listener and analysis framework that monitors token and liquidity migrations from launchpads to decentralized exchanges (DEXs).
It detects on-chain movements, calculates deltas between pool states, and delivers real-time insights through Telegram and backend APIs.

This system is designed for developers, quant researchers, and arbitrage traders who need real-time, reliable, and scalable data pipelines across Solana and EVM ecosystems.

---

## 🌐 Supported Ecosystems  

| Blockchain | Launchpads / DEXs Supported |
|-------------|-----------------------------|
| **Solana** | Pump.fun · Raydium LaunchLab · Meteora · Moonit · Bonkfun · Boopfun · Believe.io |
| **EVM** | Avalaunch · Arena Trade · VirtualBase |

Each supported DEX follows a standardized interface layer for consistent event decoding and pool state normalization, ensuring interoperability and modular scalability.

---

## ✨ Features

- ✅ Real-time detection of token migrations via event listeners.
- ✅ Supports **Solana** networks.
- ✅ Monitors multiple DEXs: `pumpfun`, `raydium launchpad`, `bonkfun`, `believe.io`, `moonit`, `boopfun`, `meteora`, `arena trade`, `virtual base`, `avalaunch`.
- ✅ Stores migration data as `.parquet` files, named by `poolId`, for efficient analysis.
- ✅ Uses **PM2** to run multi-threaded workers inside Docker.
- ✅ RabbitMQ-backed task/message queueing.
- ✅ Telegram integration for instant migration alerts.

---

## ⚙️ System Architecture  

### 🧩 Core Design Pattern: *Event-Driven, Queue-Backed Microservices*  

MPA is structured around **decoupled worker processes** communicating via **RabbitMQ** or **AWS SQS**, enabling concurrent and reliable data flow.

#### 🔸 Key Components  

1. **Event Listener**
   - Subscribes to blockchain transaction streams (via Helius RPC / WebSocket)
   - Filters and normalizes token migration-related events
   - Pushes structured payloads into the **TX Queue**

2. **Initializer Worker**
   - Parses new migration transactions  
   - Extracts base/quote token reserves and LP metrics  
   - Stores initial state in Redis  
   - Emits initialization result into the **Output Queue**  

3. **Monitor Worker**
   - Consumes pool references from delay queues (DLX)  
   - Fetches updated on-chain reserves and LP supply  
   - Calculates deltas between old/new states  
   - Updates Redis and persists comprehensive pool snapshots  
   - Pushes real-time delta summaries to Telegram / PostgreSQL  

4. **Redis Layer**
   - Caches pool states (`chainId-poolId` keyed objects)  
   - Enables microsecond-level read/write performance for delta computations  

5. **PostgreSQL**
   - Persists historical pool metrics  
   - Supports analytical querying and backtesting  

6. **Queue Infrastructure**
   - **RabbitMQ** or **AWS SQS / ElasticMQ** handle asynchronous job orchestration  
   - DLQs ensure resiliency and re-processing for failed or delayed tasks  

7. **Telegram Bot Service**
   - Acts as the live interface for operators and analysts  
   - Supports pool management, event subscriptions, and metric visualization  

---

<img width="591" height="500" alt="Screenshot 2025-10-21 045629" src="https://github.com/user-attachments/assets/85b8e76e-fb61-4664-8961-341df7ce618d" />

*Initializer and Monitor Worker data flow and queue reprocessing loop.*

---

## 🛠 How to Run the Project

### 1. Clone the Repository
    
    git clone https://github.com/your-username/Event-Listener-Bot.git
    cd Event-Listener-Bot


### 2. Install Dependencies

    command: npm install


### 3. Build Docker Containers

    command: docker compose build --no-cache

    Builds Docker images for all services without using cached layers.


### 4. Start the Application

    command: npm run start

    Launch RabbitMQ (used for task queuing between threads).
    Start all data collection threads using PM2.
    Expose the following services:
        RabbitMQ (AMQP): amqp://localhost:5672
        RabbitMQ Management UI: http://localhost:15672


### 5. View Logs

    command: docker compose logs -f

    Tails logs for all running services in real-time.
### 6. Shut Down

    command: docker compose down -v

    Stops and removes all containers, volumes, and RabbitMQ queues.

## How to set the .env

    # RPC configuration

    RPC_ENDPOINT=https://your.rpc.node
    RPC_WEBSOCKET_ENDPOINT=wss://your.websocket.node

    # Network settings

    NETWORK=solana                # Options: solana
    DEX=all                       # Options: pumpswap, launchpad, bonk, believe, moonit, boop, all

    # Telegram Bot Integration

    BOT_TOKEN=your_bot_token     # Telegram Bot token
    CHAT_ID=-1001234567890       # Use @channel_username (public) or -100... (private)

    # Running Method Setting

    IS_LOCAL=ture                # IS_LOCAL=true: local method, IS_LOCAL=false: docker method

## 📲 Telegram Bot Commands

The project includes a Telegram bot for interacting with the Event Listener Bot in real time. Below are the main commands you can use:

### `/add:<poolAddress>`
Add a new pool to the monitoring queue by sending the command with the pool address:

    /add:<poolAddress>

- Example:
    /add:PfPQmYNyjEaDdJio5AeGHJs1qNcvUE7zzsbyw3Gs1j3
- The bot will validate the address and add it to the queue if it is not already present.
- You will receive a confirmation or error message in the channel.

### `/list`
List all pools currently in the RabbitMQ queue. The bot will reply with a compact, visually formatted table showing:

- No (index)
- poolId (shortened, with 📋 inline button for copy)
- tokenAddress (shortened, with 📋 inline button for copy)
- symbol
- dex (folder name)

The table uses Unicode box-drawing characters for clarity and compactness. Each row has 📋 buttons for poolId and tokenAddress. When you tap a 📋 button, the bot replies with the full address in a code block for easy copying.

Example output:

```
┌────┬──────────────┬──────────────┬────────┬────────┐
│ No │ poolId       │ tokenAddr    │Symbol  │ DEX    │
├────┼──────────────┼──────────────┼────────┼────────┤
│ 1  │ 5j8s...mxd9  │ YfDc...pump  │ NaziGP │ PumpSw │
│ 2  │ 8k2a...9xk2  │ 2Kum...pump  │ DeepRe │ PumpSw │
└────┴──────────────┴──────────────┴────────┴────────┘
```

Below the table, you will see 📋 buttons for each poolId and tokenAddress. Tap a button to get the full address for copying.

---

## Contact

- **Telegram:** [https://t.me/Kei4650](https://t.me/Kei4650)  
- **Twitter:** [https://x.com/kei_4650](https://x.com/kei_4650)  
