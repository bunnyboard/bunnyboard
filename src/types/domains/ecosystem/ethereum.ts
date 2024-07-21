// contracts that were called by transaction senders
export interface EthereumGasGruzzler {
  // the contract address
  contract: string;

  // total gasUsed from all transactions to the contract
  gasUsed: string;
  
  // total fee was paid by sender from all transactions to the contract
  feePaid: string;
}

export interface EthereumGasSpender {
  // the sender address
  spender: string;

  // total gasUsed from all transactions to the contract
  gasUsed: string;

  // average gas price was paid by the spender
  // value in ETH
  avgGasPrice: string;

  // total fee was paid by spender from all transactions
  feePaid: string;
}

export interface EthereumDataTimeframe {
  protocol: string;
  chain: string;
  timestamp: number;

  // total ETH supply which was ever exists
  totalCoinSUpply: string;

  // total ETH was deposited into staking contract
  volumeCoinDeposited: string;

  // total ETH was withdrawn
  volumeCoinWithdrawn: string;

  // total ETH was transfered on-chain transactions
  // count transaction.value
  volumeCoinTransferred: string;

  // total ETH was burned by EIP-1559
  volumeCoinBurnt: string;

  // total ETH fee was paid from transaction fee
  volumeCoinFeePaid: string;

  // total gas limits from all blocks
  totalGasLimit: string;

  // total gas were spent

  // list of gas gruzzler
  gasGuzzlers: Array<EthereumGasGruzzler>;

  // list of gas spenders
  gasSpenders: Array<EthereumGasSpender>;

  // total transactions were sent
  transactionCount: number;
}
