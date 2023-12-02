// time
import BigNumber from 'bignumber.js';

export const DAY = 24 * 60 * 60;
export const YEAR = 365 * DAY;

// solidity unit
export const UNIT_RAY = new BigNumber(1e27).toString(10);

export const BlockSubGraphEndpoints: { [key: string]: string } = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks',
  base: 'https://api.studio.thegraph.com/query/48211/base-blocks/version/latest',
  optimism: 'https://api.thegraph.com/subgraphs/name/ianlapham/uni-testing-subgraph',
  polygon: 'https://api.thegraph.com/subgraphs/name/matthewlilley/polygon-blocks',
  bnbchain: 'https://api.thegraph.com/subgraphs/name/matthewlilley/bsc-blocks',
  avalanche: 'https://api.thegraph.com/subgraphs/name/matthewlilley/avalanche-blocks',
  fantom: 'https://api.thegraph.com/subgraphs/name/matthewlilley/fantom-blocks',
};

export const AddressZero = '0x0000000000000000000000000000000000000000';
export const AddressE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const AddressF = '0xffffffffffffffffffffffffffffffffffffffff';

// chain => number of second per block confirmation
export const ChainBlockPeriods: { [key: string]: number } = {
  ethereum: 13, // 13 seconds
  bnbchain: 3, // 3 seconds
};
