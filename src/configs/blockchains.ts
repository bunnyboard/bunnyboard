import dotenv from 'dotenv';

import { Blockchain } from '../types/configs';
import { AddressZero, BlockSubGraphEndpoints } from './constants';

// global env and configurations
dotenv.config();

export const BlockchainConfigs: { [key: string]: Blockchain } = {
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
      chain: 'arbitrum',
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
      chain: 'base',
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
      chain: 'optimism',
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
      chain: 'polygon',
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
      chain: 'bnbchain',
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
  metis: {
    name: 'metis',
    family: 'evm',
    chainId: 1088,
    nodeRpc: String(process.env.BUNNYBOARD_METIS_NODE),
    blockSubgraph: BlockSubGraphEndpoints.metis,
    nativeToken: {
      chain: 'metis',
      address: AddressZero,
      symbol: 'METIS',
      decimals: 18,
    },
  },
  gnosis: {
    name: 'gnosis',
    family: 'evm',
    chainId: 100,
    nodeRpc: String(process.env.BUNNYBOARD_GNOSIS_NODE),
    blockSubgraph: BlockSubGraphEndpoints.gnosis,
    nativeToken: {
      chain: 'gnosis',
      address: AddressZero,
      symbol: 'xDAI',
      decimals: 18,
    },
  },
};
