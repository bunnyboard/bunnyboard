import dotenv from 'dotenv';

import { EnvConfig } from '../types/configs';
import { AddressZero, BlockSubGraphEndpoints } from './constants';

// global env and configurations
dotenv.config();

const MongodbPrefix = 'magicbunny';

const envConfig: EnvConfig = {
  mongodb: {
    databaseName: String(process.env.MAGICBUNNY_MONGODB_NAME),
    connectionUri: String(process.env.MAGICBUNNY_MONGODB_URI),
    collections: {
      states: `${MongodbPrefix}.states`,
      contracts: `${MongodbPrefix}.contracts`,
      rawlogs: `${MongodbPrefix}.rawlogs`,
      tokenPrices: `${MongodbPrefix}.token.prices`,
      lendingMarketSnapshots: `${MongodbPrefix}.snapshots.lending.markets`,
    },
  },
  blockchains: {
    ethereum: {
      name: 'ethereum',
      family: 'evm',
      chainId: 1,
      nodeRpc: String(process.env.MAGICBUNNY_ETHEREUM_NODE),
      blockSubgraph: BlockSubGraphEndpoints.ethereum,
      nativeToken: {
        chain: 'ethereum',
        address: AddressZero,
        symbol: 'ETH',
        decimals: 18,
      },
    },
    arbitrum: {
      name: 'arbitrum',
      family: 'evm',
      chainId: 42161,
      nodeRpc: String(process.env.MAGICBUNNY_ARBITRUM_NODE),
      blockSubgraph: BlockSubGraphEndpoints.arbitrum,
      nativeToken: {
        chain: 'ethereum',
        address: AddressZero,
        symbol: 'ETH',
        decimals: 18,
      },
    },
    base: {
      name: 'base',
      family: 'evm',
      chainId: 8453,
      nodeRpc: String(process.env.MAGICBUNNY_BASE_NODE),
      blockSubgraph: BlockSubGraphEndpoints.base,
      nativeToken: {
        chain: 'ethereum',
        address: AddressZero,
        symbol: 'ETH',
        decimals: 18,
      },
    },
    optimism: {
      name: 'optimism',
      family: 'evm',
      chainId: 10,
      nodeRpc: String(process.env.MAGICBUNNY_OPTIMISM_NODE),
      blockSubgraph: BlockSubGraphEndpoints.optimism,
      nativeToken: {
        chain: 'ethereum',
        address: AddressZero,
        symbol: 'ETH',
        decimals: 18,
      },
    },
    polygon: {
      name: 'polygon',
      family: 'evm',
      chainId: 137,
      nodeRpc: String(process.env.MAGICBUNNY_POLYGON_NODE),
      blockSubgraph: BlockSubGraphEndpoints.polygon,
      nativeToken: {
        chain: 'ethereum',
        address: AddressZero,
        symbol: 'MATIC',
        decimals: 18,
      },
    },
    bnbchain: {
      name: 'bnbchain',
      family: 'evm',
      chainId: 56,
      nodeRpc: String(process.env.MAGICBUNNY_BNBCHAIN_NODE),
      blockSubgraph: BlockSubGraphEndpoints.bnbchain,
      nativeToken: {
        chain: 'ethereum',
        address: AddressZero,
        symbol: 'BNB',
        decimals: 18,
      },
    },
  },
};

export default envConfig;
