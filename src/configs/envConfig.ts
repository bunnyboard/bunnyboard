import dotenv from 'dotenv';

import { EnvConfig } from '../types/configs';
import { AddressZero, BlockSubGraphEndpoints } from './constants';

// global env and configurations
dotenv.config();

const MongodbPrefix = 'board';

const envConfig: EnvConfig = {
  mongodb: {
    databaseName: String(process.env.BUNNYBOARD_MONGODB_NAME),
    connectionUri: String(process.env.BUNNYBOARD_MONGODB_URI),
    collections: {
      states: `${MongodbPrefix}.states`,
      caching: `${MongodbPrefix}.caching`,
      tokenPrices: `${MongodbPrefix}.tokenPrices`,
      lendingMarketSnapshots: `${MongodbPrefix}.lendingMarketSnapshots`,
      masterchefPoolSnapshots: `${MongodbPrefix}.masterchefPoolSnapshots`,
      masterchefPoolActivities: `${MongodbPrefix}.masterchefPoolActivities`,
    },
  },
  blockchains: {
    ethereum: {
      name: 'ethereum',
      family: 'evm',
      chainId: 1,
      nodeRpc: String(process.env.BUNNYBOARD_ETHEREUM_NODE),
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
      nodeRpc: String(process.env.BUNNYBOARD_ARBITRUM_NODE),
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
      nodeRpc: String(process.env.BUNNYBOARD_BASE_NODE),
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
      nodeRpc: String(process.env.BUNNYBOARD_OPTIMISM_NODE),
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
      nodeRpc: String(process.env.BUNNYBOARD_POLYGON_NODE),
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
      nodeRpc: String(process.env.BUNNYBOARD_BNBCHAIN_NODE),
      blockSubgraph: BlockSubGraphEndpoints.bnbchain,
      nativeToken: {
        chain: 'ethereum',
        address: AddressZero,
        symbol: 'BNB',
        decimals: 18,
      },
    },
    avalanche: {
      name: 'avalanche',
      family: 'evm',
      chainId: 43114,
      nodeRpc: String(process.env.BUNNYBOARD_AVALANCHE_NODE),
      blockSubgraph: BlockSubGraphEndpoints.avalanche,
      nativeToken: {
        chain: 'avalanche',
        address: AddressZero,
        symbol: 'AVAX',
        decimals: 18,
      },
    },
    fantom: {
      name: 'fantom',
      family: 'evm',
      chainId: 250,
      nodeRpc: String(process.env.BUNNYBOARD_FANTOM_NODE),
      blockSubgraph: BlockSubGraphEndpoints.fantom,
      nativeToken: {
        chain: 'fantom',
        address: AddressZero,
        symbol: 'FTM',
        decimals: 18,
      },
    },
  },
};

export default envConfig;
