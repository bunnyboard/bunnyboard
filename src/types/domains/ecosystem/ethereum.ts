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

export interface EthereumLiquidStakingStats {
  protocol: string;

  // total ETh were being staked
  totalDeposited: string;
}

// the miner/validator address
export interface EthereumMinerStats {
  address: string;
  producedBlockCount: number;
  feesEarned: string;
}

export interface EthereumAddressStats {
  address: string;
  totalGasUsed: string;
  totalFeesBurnt: string;
  totalFeesPaid: string;
  transactionCount: number;
}

export interface EthereumDataTimeframe {
  protocol: string;
  chain: string;
  timestamp: number;

  coinPrice: string;

  // total ETH was deposited into beacon staking contract
  totalBeaconDeposited: string;

  // total ETH was withdrawn from beacon chain
  totalBeaconWithdrawn: string;

  // total ETH was burned by EIP-1559
  totalFeesBurnt: string;

  // total ETH was paid from transactions fees
  totalFeesPaid: string;

  // total gas limits from all blocks
  totalGasLimit: string;

  // total gas were spent
  totalGasUsed: string;

  // total transactions were sent
  transactionCount: number;

  // transaction types distribution
  transactionTypes: {
    [key: string]: number;
  };

  // sender addresses
  senderAddresses: Array<EthereumAddressStats>;

  // address/contract consume gas
  guzzlerAddresses: Array<EthereumAddressStats>;

  // fee recipients or block builders
  minerAddresses: Array<EthereumMinerStats>;

  // list of beacon deposits
  beaconDeposits: Array<EthereumBeaconDeposit>;

  // list of layer 2 bridge stats
  layer2: Array<EthereumLayer2Stats>;

  // liquid staking
  liquidStaking: Array<EthereumLiquidStakingStats>;
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
}

export interface EthereumDataStateWithTimeframe extends EthereumDataState {
  // previous day data
  last24Hours: EthereumDataTimeframe | null;
}
