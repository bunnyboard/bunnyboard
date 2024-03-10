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

export const BlockSubGraphEndpoints: { [key: string]: string } = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks',
  base: 'https://api.studio.thegraph.com/query/48211/base-blocks/version/latest',
  optimism: 'https://api.thegraph.com/subgraphs/name/ianlapham/uni-testing-subgraph',
  polygon: 'https://api.thegraph.com/subgraphs/name/matthewlilley/polygon-blocks',
  bnbchain: 'https://api.thegraph.com/subgraphs/name/matthewlilley/bsc-blocks',
  avalanche: 'https://api.thegraph.com/subgraphs/name/matthewlilley/avalanche-blocks',
  fantom: 'https://api.thegraph.com/subgraphs/name/matthewlilley/fantom-blocks',
  metis: 'https://andromeda.thegraph.metis.io/subgraphs/name/netswap/blocks',
  gnosis: 'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks',
};

export const AddressZero = '0x0000000000000000000000000000000000000000';
export const AddressE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const AddressF = '0xffffffffffffffffffffffffffffffffffffffff';
// export const AddressMulticall3 = '0xca11bde05977b3631167028862be2a173976ca11';

export const Erc20TransferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// chain => number of second per block confirmation
export const ChainBlockPeriods: { [key: string]: number } = {
  ethereum: 13, // 13 seconds
  arbitrum: 1, // 1 seconds
  base: 2, // 2 seconds
  bnbchain: 3, // 3 seconds
  optimism: 2, // 2 seconds
  avalanche: 2, // 2 seconds
  fantom: 2, // 2 seconds
};
