export interface EthereumBeaconDeposit {
  depositor: string;

  // transaction to address
  contract: string;

  // amount deposit, from DepositEvent
  amount: string;
}

export interface EthereumLayer2Stats {
  layer2: string;

  // total ETH were being locked in contract layer
  totalCoinLocked: string;
}

export interface EthereumLiquidStakingData {
  protocol: string;

  // total ETh were being staked
  totalDeposited: string;
}

export interface EthereumMinerStats {
  address: string;
  producedBlockCount: number;
}

export interface EthereumSenderStats {
  address: string;
  transactionCount: number;
}

export interface EthereumDataTimeframe {
  protocol: string;
  chain: string;
  timestamp: number;

  coinPrice: string;

  // total ETH was deposited into staking contract
  volumeCoinDeposited: string;

  // total ETH was withdrawn
  volumeCoinWithdrawn: string;

  // total ETH was burned by EIP-1559
  volumeCoinBurnt: string;

  // total gas limits from all blocks
  gasLimit: string;

  // total gas were spent
  gasUsed: string;

  // total transactions were sent
  transactionCount: number;

  // transaction type distribution
  transactuonTypes: {
    [key: string]: number;
  };

  // sender addresses
  senderAddresses: Array<EthereumSenderStats>;

  // fee recipients or block builders
  minerAddresses: Array<EthereumMinerStats>;

  // list of beacon deposits
  beaconDeposits: Array<EthereumBeaconDeposit>;

  // list of layer 2 bridge stats
  layer2: Array<EthereumLayer2Stats>;

  // liquid staking
  liquidStaking: Array<EthereumLiquidStakingData>;
}

export interface EthereumBeaconStats {
  // total validators includes all status from the genesis
  totalValidator: number;

  // status => validator count
  validatorStatus: {
    [key: string]: number;
  };
}

export interface EthereumDataState extends EthereumDataTimeframe {
  // total ETH supply ever exists
  totalCoinSupply: string;

  // total ETH were ever burnt
  totalCoinBurnt: string;

  // total ETH rewards for eth2 staking
  totalCoinEth2Rewards: string;

  // total ETH were withdrawn from eth2
  totalCoinEth2Withdrawn: string;

  // current beacon chain stats
  beaconStats: EthereumBeaconStats | null;
}

export interface EthereumDataStateWithTimeframe extends EthereumDataState {
  // previous day data
  last24Hours: EthereumDataTimeframe | null;
}
