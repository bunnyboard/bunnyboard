import BigNumber from 'bignumber.js';

// time
export const TimeUnits = {
  SecondsPerDay: 24 * 60 * 60,
  DaysPerYear: 365,
  SecondsPerYear: 365 * 24 * 60 * 60,
};

// solidity unit
export const SolidityUnits = {
  OneWad: new BigNumber(1e18).toString(10),
  OneRay: new BigNumber(1e27).toString(10),
  OneRad: new BigNumber(1e45).toString(10),
  WadDecimals: 18,
  RayDecimals: 27,
  RadDecimals: 45,
};

export const AddressZero = '0x0000000000000000000000000000000000000000';
export const AddressE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const AddressF = '0xffffffffffffffffffffffffffffffffffffffff';
export const AddressMulticall3 = '0xca11bde05977b3631167028862be2a173976ca11';

export const Erc20TransferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export const EthereumBeaconDepositContract = '0x00000000219ab540356cbb839cbe05303d7705fa';

// chain => number of second per block confirmation
export const ChainBlockPeriods: { [key: string]: number } = {
  ethereum: 13, // 13 seconds
  arbitrum: 1, // 1 seconds
  base: 2, // 2 seconds
  bnbchain: 3, // 3 seconds
  optimism: 2, // 2 seconds
  avalanche: 2, // 2 seconds
  fantom: 2, // 2 seconds
  linea: 1, // 1 seconds
  blast: 2, // 2 seconds
  mode: 2, // 2 seconds
  cronos: 5.6, // 5.6 seconds
  scroll: 3, // 3 seconds
};

// we track dex volume only on pools have more than $10k liquidity
export const DexBaseTokenBalanceUsdMinToTrackVolume = 10_000;
