import dotenv from 'dotenv';

import { Blockchain } from '../types/configs';
import { AddressZero } from './constants';
import { ChainNames } from './names';

// global env and configurations
dotenv.config();

export const BlockchainConfigs: { [key: string]: Blockchain } = {
  [ChainNames.ethereum]: {
    name: ChainNames.ethereum,
    family: 'evm',
    chainId: 1,
    nodeRpc: String(process.env.BUNNYBOARD_ETHEREUM_NODE),
    explorerApiEndpoint: 'https://api.etherscan.io/api',
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
    explorerApiEndpoint: 'https://api.arbiscan.io/api',
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
    explorerApiEndpoint: 'https://api.basescan.org/api',
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
    explorerApiEndpoint: 'https://api-optimistic.etherscan.io/api',
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
    explorerApiEndpoint: 'https://api.polygonscan.com/api',
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
    explorerApiEndpoint: 'https://api.bscscan.com/api',
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
    explorerApiEndpoint: 'https://api.snowscan.xyz/api',
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
    explorerApiEndpoint: 'https://api.ftmscan.com/api',
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
    explorerApiEndpoint: 'https://api.gnosisscan.io/api',
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
    explorerApiEndpoint: 'https://api.lineascan.build/api',
    nativeToken: {
      chain: ChainNames.linea,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.zksync]: {
    name: ChainNames.zksync,
    family: 'evm',
    chainId: 324,
    nodeRpc: String(process.env.BUNNYBOARD_ZKSYNC_NODE),
    explorerApiEndpoint: 'https://api-era.zksync.network/api',
    nativeToken: {
      chain: ChainNames.zksync,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.mode]: {
    name: ChainNames.mode,
    family: 'evm',
    chainId: 34443,
    nodeRpc: String(process.env.BUNNYBOARD_MODE_NODE),
    explorerApiEndpoint: 'https://explorer.mode.network/api',
    nativeToken: {
      chain: ChainNames.mode,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.manta]: {
    name: ChainNames.manta,
    family: 'evm',
    chainId: 169,
    nodeRpc: String(process.env.BUNNYBOARD_MANTA_NODE),
    explorerApiEndpoint: 'https://pacific-explorer.manta.network/api',
    nativeToken: {
      chain: ChainNames.manta,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.aurora]: {
    name: ChainNames.aurora,
    family: 'evm',
    chainId: 1313161554,
    nodeRpc: String(process.env.BUNNYBOARD_AURORA_NODE),
    explorerApiEndpoint: 'https://explorer.aurora.dev/api',
    nativeToken: {
      chain: ChainNames.aurora,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.mantle]: {
    name: ChainNames.mantle,
    family: 'evm',
    chainId: 5000,
    nodeRpc: String(process.env.BUNNYBOARD_MANTLE_NODE),
    explorerApiEndpoint: 'https://explorer.mantle.xyz/api',
    nativeToken: {
      chain: ChainNames.mantle,
      address: AddressZero,
      symbol: 'MNT',
      decimals: 18,
    },
  },
  [ChainNames.polygonzkevm]: {
    name: ChainNames.polygonzkevm,
    family: 'evm',
    chainId: 1101,
    nodeRpc: String(process.env.BUNNYBOARD_POLYGONZKEVM_NODE),
    explorerApiEndpoint: 'https://api-zkevm.polygonscan.com/api',
    nativeToken: {
      chain: ChainNames.polygonzkevm,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.zora]: {
    name: ChainNames.zora,
    family: 'evm',
    chainId: 7777777,
    nodeRpc: String(process.env.BUNNYBOARD_ZORA_NODE),
    explorerApiEndpoint: 'https://explorer.zora.energy/api',
    nativeToken: {
      chain: ChainNames.zora,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.merlin]: {
    name: ChainNames.merlin,
    family: 'evm',
    chainId: 4200,
    nodeRpc: String(process.env.BUNNYBOARD_MERLIN_NODE),
    explorerApiEndpoint: 'https://scan.merlinchain.io/api',
    nativeToken: {
      chain: ChainNames.merlin,
      address: AddressZero,
      symbol: 'BTC',
      decimals: 18,
    },
  },
  [ChainNames.zklinknova]: {
    name: ChainNames.zklinknova,
    family: 'evm',
    chainId: 810180,
    nodeRpc: String(process.env.BUNNYBOARD_ZKLINKNOVA_NODE),
    explorerApiEndpoint: 'https://explorer-api.zklink.io/api',
    nativeToken: {
      chain: ChainNames.zklinknova,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.cronos]: {
    name: ChainNames.cronos,
    family: 'evm',
    chainId: 25,
    nodeRpc: String(process.env.BUNNYBOARD_CRONOS_NODE),
    explorerApiEndpoint: 'https://api.cronoscan.com/api',
    nativeToken: {
      chain: ChainNames.cronos,
      address: AddressZero,
      symbol: 'CRO',
      decimals: 18,
    },
  },
  [ChainNames.moonbeam]: {
    name: ChainNames.moonbeam,
    family: 'evm',
    chainId: 1284,
    nodeRpc: String(process.env.BUNNYBOARD_MOONBEAM_NODE),
    explorerApiEndpoint: 'https://api-moonbeam.moonscan.io/api',
    nativeToken: {
      chain: ChainNames.moonbeam,
      address: AddressZero,
      symbol: 'GLMR',
      decimals: 18,
    },
  },
  [ChainNames.moonriver]: {
    name: ChainNames.moonriver,
    family: 'evm',
    chainId: 1285,
    nodeRpc: String(process.env.BUNNYBOARD_MOONRIVER_NODE),
    explorerApiEndpoint: 'https://api-moonriver.moonscan.io/api',
    nativeToken: {
      chain: ChainNames.moonriver,
      address: AddressZero,
      symbol: 'MOVR',
      decimals: 18,
    },
  },
  [ChainNames.core]: {
    name: ChainNames.core,
    family: 'evm',
    chainId: 1116,
    nodeRpc: String(process.env.BUNNYBOARD_CORE_NODE),
    explorerApiEndpoint: 'https://openapi.coredao.org/api',
    nativeToken: {
      chain: ChainNames.core,
      address: AddressZero,
      symbol: 'CORE',
      decimals: 18,
    },
  },
  [ChainNames.bitlayer]: {
    name: ChainNames.bitlayer,
    family: 'evm',
    chainId: 200901,
    nodeRpc: String(process.env.BUNNYBOARD_BITLAYER_NODE),
    explorerApiEndpoint: 'https://api.btrscan.com/scan/api',
    nativeToken: {
      chain: ChainNames.bitlayer,
      address: AddressZero,
      symbol: 'BTC',
      decimals: 18,
    },
  },
};
