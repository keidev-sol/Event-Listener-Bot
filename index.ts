import { exec } from 'child_process';
import { IS_LOCAL } from './constants';

const args = process.argv.slice(2);

let network = args[1];
let dex = args[3];

if( IS_LOCAL ) {
   network = args[0];
   dex = args[1];
} 


const runScript = (script: string) => {
   const child = exec(`ts-node ${script}`);
   child.stdout?.pipe(process.stdout);
   child.stderr?.pipe(process.stderr);
};

if (network === 'solana') {
   switch (dex) {
      case "pumpswap":
         runScript('dex/solana/pumpSwap.ts');
         break;
      case "launchpad":
         runScript('dex/solana/raydiumLaunchpad.ts');
         break;
      case "bonk":
         runScript('dex/solana/bonk.ts');
         break;
      case "believe":
         runScript('dex/solana/believe.ts');
         break;
      case "moonit":
         runScript('dex/solana/moonit.ts');
         break;
      case "boop":
         runScript('dex/solana/boop.ts');
         break;
      case "all":
         runScript('dex/solana/believe.ts');
         runScript('dex/solana/bonk.ts');
         runScript('dex/solana/raydiumLaunchpad.ts');
         runScript('dex/solana/pumpSwap.ts');
         runScript('dex/solana/moonit.ts');
         runScript('dex/solana/boop.ts');
         break;
      default:
         console.log("incorrect dex...")
         break;
   }
} else if (network === 'ethereum') {
   switch (dex) {
      case "virtualbase":
         runScript('dex/ether/virtualBase.ts');
         break;

      case "arenatrade":
         runScript('dex/ether/arenaTrade.ts');
         break;
         
      case "all":
         runScript('dex/ether/virtualBase.ts');
         runScript('dex/ether/arenaTrade.ts');
         break;

      default:
         console.log("incorrect dex...")
         break;
   }
}
 else {
   console.log("incorrect network...")
}
