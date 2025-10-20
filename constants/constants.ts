import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

import PumpswapIDL from '../idl/pumpswap.json';
import PumpfunIDL from '../idl/pumpfun-new.json';
import LaunchLabIDL from '../idl/raydiumLaunchpad.json';
import { PumpSwap } from '../idl/pumpswap';
import { PumpFun } from '../idl/pumpfun-new';
import { RaydiumLaunchpad } from "../idl/raydiumLaunchpad";
import * as dotenv from 'dotenv';
import { ethers } from "ethers";

dotenv.config();

export const RPC_ENDPOINT = process.env.RPC_ENDPOINT || ""
export const RPC_WEBSOCKET_ENDPOINT = process.env.RPC_WEBSOCKET_ENDPOINT || ""
export const BOT_TOKEN = process.env.BOT_TOKEN || ""
export const CHAT_ID = Number(process.env.CHAT_ID)
export const NETWORK = process.env.NETWORK || "solana"
export const DEX = process.env.DEX || "pumpswap"

export const LaunchPad_Program_ID = "LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj"
export const Bonk_Platform_ID = "FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1"

export const Believe_Custom_ProgramId = "GNgQV3f8itXFbHVcuYxMY9gpzDCyCfAnDXqSUMFHh3YF"     //Meteora Pools Program

export const Dynamic_Bonding_Curve_ProgramId = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"     //Meteora Dynamic Bonding Curve Program
export const Believe_Dyn2_ConfigId = "CKupGn17nQ3Qjv35UKuGa9cHqDrnGxGEQsjT9xH5RRZK"     

export const Moonit_Meteora_Pools_ProgramId = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB" 
export const Moonit_Raydium_Liquidity_PoolV4_ProgramId = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8" 

export const Moonit_Meteora_Pools_ConfigId = "21PjsfQVgrn56jSypUT5qXwwSjwKWvuoBCKbVZrgTLz4" 
export const Moonit_Raydium_Liquidity_Pool_ConfigId = "9DCxsMizn3H1hprZ7xWe6LDzeUeZBksYFpBWBtSf1PQX" 

export const Boop_Program_ID = "boop8hVGQGqehUK2iVEMEnMrL5RbjywRzHKBmBE7ry4"
export const CPMM_PROGRAM_ID = "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"

export const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export const solanaConnection = new Connection(RPC_ENDPOINT, {
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
    commitment: 'confirmed',
});
export const provider = new AnchorProvider(solanaConnection, new NodeWallet(Keypair.generate()));
export const PumpswapProgram = new Program<PumpSwap>(PumpswapIDL as PumpSwap, provider);
export const PumpfunProgram = new Program<PumpFun>(PumpfunIDL as PumpFun, provider);
export const LaunchlapProgram = new Program<RaydiumLaunchpad>(LaunchLabIDL as RaydiumLaunchpad, provider);


// ======== solana ======== //
export const pumpSwapFolder = "PumpSwap"
export const launchpadFolder = "RaydiumLaunchpad"
export const bonkFolder = "Bonk"
export const believeFolder = "Believe"
export const moonitFolder = "Moonit"
export const boopFolder = "Boop"


// ======== ethereum ======== //
export const virtualBaseFolder = "VirtualBase"
export const arenaTradeFolder = "ArenaTrade"

export const CHECK_INTERVAL = 60_000


export const pumpSwapId = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
export const launchpadCpmmId = "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
export const launchpadAmmId = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
export const bonkId = "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
export const believeID = "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"      //Meteora DAMM v2
export const moonitDynId = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB"
export const moonitRayId = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
export const boopId = "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"



export const BASE_RPC_ENDPOINT = process.env.NEXT_PUBLIC_BASE_RPC_WSS_ENDPOINT || ""
export const ARENA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_AVALANCHE_RPC_WSS_ENDPOINT || ""

export const VIRTUAL_TOKEN_ADDRESS = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";
export const UNISWAP_V2_FACTORY_ADDRESS = "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6";
export const AGENT_FACTORY_ADDRESS = "0x42f4f5A3389CA0BeD694dE339f4d432aCdDb1Ea9";
export const ARENA_FACTORY_ADDRESS = "0x8315f1eb449Dd4B779495C3A0b05e5d194446c6e";
export const AVAX_TOKEN_ADDRESS = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";


export const UNISWAP_PAIR_ABI = [
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function totalSupply() view returns (uint256)"
  ];

  
export const ERC20_ABI = [
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];

export const ARENA_PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function totalSupply() external view returns (uint256)"
];

export const ARENA_ERC20_ABI = [
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];
  
export const virtual_provider = new ethers.WebSocketProvider(BASE_RPC_ENDPOINT);      

export const arena_provider = new ethers.WebSocketProvider(ARENA_RPC_ENDPOINT);      

export const pairCreateEventABI = [
	"event PairCreated(address indexed token0, address indexed token1, address pair, uint256)"
  ];


export const IS_LOCAL = process.env.RPC_ENDPOINT || false;

export const RabbitMQ_Url = IS_LOCAL? "amqp://user:password@localhost:5672" : "amqp://user:password@rabbitmq:5672"
