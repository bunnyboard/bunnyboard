export interface ChainBoardLogEntry {
  address: string;
  signature: string;
}

export interface ChainBoardDataMetrics {
  // sum gas limit of all blocks in snapshot time
  totalGasLimit: string;

  // sum gas used all blocks in snapshot time
  totalGasUsed: string;

  // native coin transfer volume
  // simply count tx.value
  volumeCoinTransfer: string;

  // calculate average size (in bytes) of all blocks in snapshot time
  averageBlockSize: string;

  // total number of transactions were transact in all blocks
  numberOfTransactions: number;

  // unique number of active addresses (were senders)
  numberOfAddresses: number;

  // new contract were deployed
  // we detect a new contract deployed with:
  // - tx.to is null (omitted)
  // - tx.data is not empty
  numberOfDeployedContracts: number;

  // for Ethereum EIP-1559
  // number of ETH were burnt
  totalCoinBurnt: string;

  // list of on-chain logs
  logs: Array<ChainBoardLogEntry>;
}

export interface ChainBoardDataTimeframe extends ChainBoardDataMetrics {
  chain: string;
  timestamp: number;
  fromBlock: number;
  toBlock: number;
}

export interface ChainBoardDataStateWithTimeframes extends ChainBoardDataTimeframe {
  // previous day data
  last24Hours: ChainBoardDataTimeframe | null;
}
