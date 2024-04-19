import dotenv from 'dotenv';

import { Blockchain } from '../types/configs';
import { AddressZero } from './constants';
import { SubgraphEndpoints } from './data';
import { ChainNames } from './names';

// global env and configurations
dotenv.config();

export const BlockchainConfigs: { [key: string]: Blockchain } = {
  [ChainNames.ethereum]: {
    name: ChainNames.ethereum,
    family: 'evm',
    chainId: 1,
    nodeRpc: String(process.env.BUNNYBOARD_ETHEREUM_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.ethereum,
    nativeToken: {
      chain: ChainNames.ethereum,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.arbitrum]: {
    name: ChainNames.arbitrum,
    family: 'evm',
    chainId: 42161,
    nodeRpc: String(process.env.BUNNYBOARD_ARBITRUM_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.arbitrum,
    nativeToken: {
      chain: ChainNames.arbitrum,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.base]: {
    name: ChainNames.base,
    family: 'evm',
    chainId: 8453,
    nodeRpc: String(process.env.BUNNYBOARD_BASE_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.base,
    nativeToken: {
      chain: ChainNames.base,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.optimism]: {
    name: ChainNames.optimism,
    family: 'evm',
    chainId: 10,
    nodeRpc: String(process.env.BUNNYBOARD_OPTIMISM_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.optimism,
    nativeToken: {
      chain: ChainNames.optimism,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.polygon]: {
    name: ChainNames.polygon,
    family: 'evm',
    chainId: 137,
    nodeRpc: String(process.env.BUNNYBOARD_POLYGON_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.polygon,
    nativeToken: {
      chain: ChainNames.polygon,
      address: AddressZero,
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  [ChainNames.bnbchain]: {
    name: ChainNames.bnbchain,
    family: 'evm',
    chainId: 56,
    nodeRpc: String(process.env.BUNNYBOARD_BNBCHAIN_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.bnbchain,
    nativeToken: {
      chain: ChainNames.bnbchain,
      address: AddressZero,
      symbol: 'BNB',
      decimals: 18,
    },
  },
  [ChainNames.avalanche]: {
    name: ChainNames.avalanche,
    family: 'evm',
    chainId: 43114,
    nodeRpc: String(process.env.BUNNYBOARD_AVALANCHE_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.avalanche,
    nativeToken: {
      chain: ChainNames.avalanche,
      address: AddressZero,
      symbol: 'AVAX',
      decimals: 18,
    },
  },
  [ChainNames.fantom]: {
    name: ChainNames.fantom,
    family: 'evm',
    chainId: 250,
    nodeRpc: String(process.env.BUNNYBOARD_FANTOM_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.fantom,
    nativeToken: {
      chain: ChainNames.fantom,
      address: AddressZero,
      symbol: 'FTM',
      decimals: 18,
    },
  },
  [ChainNames.metis]: {
    name: ChainNames.metis,
    family: 'evm',
    chainId: 1088,
    nodeRpc: String(process.env.BUNNYBOARD_METIS_NODE),
    blockSubgraph: '', // don't use or not available
    explorerApiEndpoint: 'https://api.routescan.io/v2/network/mainnet/evm/1088/etherscan/api',
    nativeToken: {
      chain: ChainNames.metis,
      address: AddressZero,
      symbol: 'METIS',
      decimals: 18,
    },
  },
  [ChainNames.gnosis]: {
    name: ChainNames.gnosis,
    family: 'evm',
    chainId: 100,
    nodeRpc: String(process.env.BUNNYBOARD_GNOSIS_NODE),
    blockSubgraph: SubgraphEndpoints.blocks.gnosis,
    nativeToken: {
      chain: ChainNames.gnosis,
      address: AddressZero,
      symbol: 'xDAI',
      decimals: 18,
    },
  },
  [ChainNames.scroll]: {
    name: ChainNames.scroll,
    family: 'evm',
    chainId: 534352,
    nodeRpc: String(process.env.BUNNYBOARD_SCROLL_NODE),
    blockSubgraph: '', // don't use or not available
    explorerApiEndpoint: 'https://api.scrollscan.com/api',
    nativeToken: {
      chain: ChainNames.scroll,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.blast]: {
    name: ChainNames.blast,
    family: 'evm',
    chainId: 81457,
    nodeRpc: String(process.env.BUNNYBOARD_BLAST_NODE),
    blockSubgraph: '', // don't use or not available
    explorerApiEndpoint: 'https://api.blastscan.io/api',
    nativeToken: {
      chain: ChainNames.blast,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.linea]: {
    name: ChainNames.linea,
    family: 'evm',
    chainId: 59144,
    nodeRpc: String(process.env.BUNNYBOARD_LINEA_NODE),
    blockSubgraph: '', // don't use or not available
    explorerApiEndpoint: 'https://api.lineascan.build/api',
    nativeToken: {
      chain: ChainNames.linea,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
};
