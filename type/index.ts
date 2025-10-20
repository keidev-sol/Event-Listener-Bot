import * as BufferLayout from '@solana/buffer-layout';

export interface PoolData {
  timestamp: string;
  lpSupply?: string;
  BaseTokenBalance?: string;
  QuoteTokenBalance?: string;
  }

  
export const SCHEMA = {
  timestamp: { type: 'UTF8' },
  lpSupply: { type: 'UTF8' },
  BaseTokenBalance: { type: 'UTF8' },
  QuoteTokenBalance: { type: 'UTF8' },
};


export function u64FromBuffer(buffer: Buffer): bigint {
  return buffer.readBigUInt64LE(0);
}

const u8 = (property: string) => BufferLayout.u8(property);
const u16 = (property: string) => BufferLayout.u16(property);
const u32 = (property: string) => BufferLayout.u32(property);
const u64 = (property: string) => BufferLayout.blob(8, property);
const u128 = (property: string) => BufferLayout.blob(16, property);
const pubkey = (property: string) => BufferLayout.blob(32, property);
const bytes = (len: number, property: string) => BufferLayout.blob(len, property);

// ---------- BaseFeeStruct ----------
const BaseFeeStruct = BufferLayout.struct<any>([
  u64('cliff_fee_numerator'),
  u8('fee_scheduler_mode'),
  BufferLayout.seq(u8('paddingByte'), 5, 'padding_0'),
  u16('number_of_period'),
  u64('period_frequency'),
  u64('reduction_factor'),
  u64('padding_1'),
]);

// ---------- DynamicFeeStruct ----------
const DynamicFeeStruct = BufferLayout.struct<any>([
  u8('initialized'),
  BufferLayout.seq(u8('paddingByte'), 7, 'padding'),
  u32('max_volatility_accumulator'),
  u32('variable_fee_control'),
  u16('bin_step'),
  u16('filter_period'),
  u16('decay_period'),
  u16('reduction_factor'),
  u64('last_update_timestamp'),
  u128('bin_step_u128'),
  u128('sqrt_price_reference'),
  u128('volatility_accumulator'),
  u128('volatility_reference'),
]);

// ---------- PoolFeesStruct ----------
const PoolFeesStruct = BufferLayout.struct<any>([
  BufferLayout.struct([...BaseFeeStruct.fields], 'base_fee'),
  u8('protocol_fee_percent'),
  u8('partner_fee_percent'),
  u8('referral_fee_percent'),
  BufferLayout.seq(u8('paddingByte'), 5, 'padding_0'),
  BufferLayout.struct([...DynamicFeeStruct.fields], 'dynamic_fee'),
  BufferLayout.seq(u64('paddingByte'), 2, 'padding_1'),
]);

// ---------- PoolMetricsLayout ----------
const PoolMetricsLayout = BufferLayout.struct<any>([
  u128('total_lp_a_fee'),
  u128('total_lp_b_fee'),
  u64('total_protocol_a_fee'),
  u64('total_protocol_b_fee'),
  u64('total_partner_a_fee'),
  u64('total_partner_b_fee'),
  u64('total_position'),
  u64('padding'),
]);

// ---------- Main BelievePoolLayout ----------
export const BelievePoolLayout = BufferLayout.struct<any>([
  // BufferLayout.blob(8, 'discriminator'),

  BufferLayout.struct([...PoolFeesStruct.fields], 'pool_fees'),

  pubkey('token_a_mint'),
  pubkey('token_b_mint'),
  pubkey('token_a_vault'),
  pubkey('token_b_vault'),
  pubkey('whitelisted_vault'),
  pubkey('partner'),
  u128('liquidity'),
  u128('_padding'),
  u64('protocol_a_fee'),
  u64('protocol_b_fee'),
  u64('partner_a_fee'),
  u64('partner_b_fee'),
  u128('sqrt_min_price'),
  u128('sqrt_max_price'),
  u128('sqrt_price'),
  u64('activation_point'),
  u8('activation_type'),
  u8('pool_status'),
  u8('token_a_flag'),
  u8('token_b_flag'),
  u8('collect_fee_mode'),
  u8('pool_type'),
  BufferLayout.seq(u8('paddingByte'), 2, '_padding_0'),
  bytes(32, 'fee_a_per_liquidity'),
  bytes(32, 'fee_b_per_liquidity'),
  u128('permanent_lock_liquidity'),
  BufferLayout.struct([...PoolMetricsLayout.fields], 'metrics'),
]);

// Optional: Debug total size


export const PoolLayout = BufferLayout.struct<any>([
  u64("discriminator"),
  pubkey('ammConfig'),
  pubkey('poolCreator'),
  pubkey('token0Vault'),
  pubkey('token1Vault'),
  pubkey('lpMint'),
  pubkey('token0Mint'),
  pubkey('token1Mint'),
  pubkey('token0Program'),
  pubkey('token1Program'),
  pubkey('observationKey'),

  BufferLayout.u8('authBump'),
  BufferLayout.u8('status'),
  BufferLayout.u8('lpMintDecimals'),
  BufferLayout.u8('mint0Decimals'),
  BufferLayout.u8('mint1Decimals'),

  u64('lpSupply'),
  u64('protocolFeesToken0'),
  u64('protocolFeesToken1'),
  u64('fundFeesToken0'),
  u64('fundFeesToken1'),
  u64('openTime'),

  BufferLayout.seq(u64('paddingItem'), 32, 'padding'),
]);



//////////////////////////////////////////////////////////


const PoolFeesStructs = BufferLayout.struct<any>([
  u64('tradeFeeNumerator'),
  u64('tradeFeeDenominator'),
  u64('protocolTradeFeeNumerator'),
  u64('protocolTradeFeeDenominator'),
]);

// PoolType struct
const PoolTypeStruct = BufferLayout.struct<any>([
  u8('value'),
]);

// Bootstrapping struct
const BootstrappingStruct = BufferLayout.struct<any>([
  u64('activationPoint'),
  pubkey('whitelistedVault'),
  pubkey('poolCreator'),
  u8('activationType'),
]);

// PartnerInfo struct
const PartnerInfoStruct = BufferLayout.struct<any>([
  u64('feeNumerator'),
  pubkey('partnerAddress'),
  u64('pendingFeeA'),
  u64('pendingFeeB'),
]);

// Padding (24 bytes)
const Padding24 = BufferLayout.blob(24, 'padding');

// CurveType struct
const CurveTypeStruct = BufferLayout.struct<any>([
  u8('value'),
]);

// Final PoolLayout using BufferLayout
export const MoonDynPoolLayout = BufferLayout.struct<any>([
  pubkey('lpMint'),
  pubkey('tokenAMint'),
  pubkey('tokenBMint'),
  pubkey('aVault'),
  pubkey('bVault'),
  pubkey('aVaultLp'),
  pubkey('bVaultLp'),
  u8('aVaultLpBump'),
  u8('enabled'),
  pubkey('protocolTokenAFee'),
  pubkey('protocolTokenBFee'),
  u64('feeLastUpdatedAt'),
  Padding24,
  BufferLayout.struct([...PoolFeesStructs.fields], 'poolFees'),
  BufferLayout.struct([...PoolTypeStruct.fields], 'poolType'),
  pubkey('stake'),
  u64('totalLockedLp'),
  BufferLayout.struct([...BootstrappingStruct.fields], 'bootstrapping'),
  BufferLayout.struct([...PartnerInfoStruct.fields], 'partnerInfo'),
  Padding24,
  BufferLayout.struct([...CurveTypeStruct.fields], 'curveType'),
]);