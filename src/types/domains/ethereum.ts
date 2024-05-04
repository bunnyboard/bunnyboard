// define data types for ethereum ecosystem board, adapters
import { ChainBoardDataMetrics } from './chainBoard';

export interface EthereumLayer2Metrics {
  chain: string;

  // total ETH was locked in smart contract on Ethereum
  bridgeTotalDeposited: string;

  // transfer ETH from Ethereum to layer 2
  bridgeVolumeDeposit: string;

  // transfer ETH from layer back to Ethereum
  bridgeVolumeWithdraw: string;
}

export interface EthereumEcosystemMetrics extends ChainBoardDataMetrics {
  // native token price in USD
  coinPrice: string;

  // number of ETH were deposited into Beacon Chain
  volumeCoinDeposited: string;

  // a list of layer 2 data
  layer2: Array<EthereumLayer2Metrics>;
}

export interface EthereumEcosystemDataTimeframe extends EthereumEcosystemMetrics {
  chain: string;
  timestamp: number;
  fromBlock: number;
  toBlock: number;
}

export interface EthereumEcosystemDataStateWithTimeframes extends EthereumEcosystemDataTimeframe {
  // previous day data
  last24Hours: EthereumEcosystemDataTimeframe | null;
}
