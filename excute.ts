import { execSync, exec } from 'child_process';
import { DEX, IS_LOCAL, NETWORK } from './constants';


try {
    console.log('Building Docker images...');
    execSync('docker compose build --no-cache', { stdio: 'inherit' });

    if (IS_LOCAL) {
        console.log('Starting only RabbitMQ...');
        execSync('docker compose up -d rabbitmq', { stdio: 'inherit' });

        console.log(`Running local script for network="${NETWORK}", dex="${DEX}"`);
        const child = exec(`ts-node index.ts ${NETWORK} ${DEX}`);
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);

        console.log("Running worker thread")
        const workerThread = exec(`ts-node rabbitmq/worker.ts`);
        workerThread.stdout?.pipe(process.stdout);
        workerThread.stderr?.pipe(process.stderr);

        console.log("Running local Tg bot")
        const botScript = exec('ts-node bot/index.ts');
        botScript.stdout?.pipe(process.stdout);
        botScript.stderr?.pipe(process.stderr);
    } else {
        console.log('Starting full Docker stack...');
        execSync('docker compose up -d', { stdio: 'inherit' });
    }


} catch (err) {
    console.error('Error during setup or execution:', err);
}
