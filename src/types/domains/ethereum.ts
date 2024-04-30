// define data types for ethereum ecosystem board, adapters

export interface EthereumSnapshotMetrics {
  // sum gas limit of all blocks in snapshot time
  totalGasLimit: string;

  // sum gas used all blocks in snapshot time
  totalGasUsed: string;

  // calculate average size (in bytes) of all blocks in snapshot time
  averageBlockSize: string;

  // total number of transactions were transact in all blocks
  numberOfTransactions: number;

  // unique number of active addresses (were senders)
  numberOfAddresses: number;
}

// https://eips.ethereum.org/EIPS/eip-1559
export interface EthereumSnapshotForEip1559 {
  // number of ETH were burnt
  totalCoinBurnt: string;

  // calculate average base fee of all blocks in snapshot time
  averageBaseFeePerGas: string;
}

export interface EthereumSnapshotShapellaForShapella {
  // number of ETH were withdrawn from ETH2 staking
  // available after shanghai upgrade
  totalCoinWithdrawn: string;
}

// snapshot of ethereum network state
export interface EthereumNetworkSnapshot
  extends EthereumSnapshotMetrics,
    EthereumSnapshotForEip1559,
    EthereumSnapshotShapellaForShapella {
  timestamp: number;

  fromBlock: number;
  toBlock: number;
}
