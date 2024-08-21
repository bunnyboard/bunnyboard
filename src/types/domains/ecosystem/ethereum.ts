import { DataMetric } from '../../configs';

export interface EthBeaconDeposit {
  // the depositor address
  depositor: string;

  // the proxy smart contract which deposited ETH to beacon
  contract: string;

  // amount deposit, from DepositEvent
  amount: string;
}

export interface EthAddressStats {
  // the from/to address of transaction
  address: string;

  // total gasUsed by this address in all transaction in block
  gasUsed: string;

  // total transaction fees were paid by this address
  // in all txn in block
  feesPaid: string;

  // total ETH was burnt by this address
  // from transaction fees were paid by this address
  feesBurnt: string;

  // total transaction were sent by from addresses
  // or called to by to address
  transactionCount: number;
}

export interface EthBlockData {
  chain: string;

  // block number
  number: number;

  // block timestamp
  timestamp: number;

  // miner (PoW) or fee recipient address (PoS)
  miner: string;

  // total ETH was earned by miner
  minerEarned: string;

  // total ETH was deposited into Beacon chain in this block
  beaconDeposited: string;

  // total ETH was withdrawn from Beacon in this block
  beaconWithdrawn: string;

  // block gas limit
  gasLimit: number;

  // block gas used total from all transactions
  gasUsed: number;

  // total transaction fees were paid
  totalFeesPaid: string;

  // total ETH fees were burnt
  totalFeesBurnt: string;

  // number of transaction of this block
  transactionCount: number;

  // transaction types distribution
  transactionTypes: {
    [key: string]: number;
  };

  // transaction from address list
  addressFrom: Array<EthAddressStats>;

  // transaction to address list
  addressTo: Array<EthAddressStats>;

  // list of beacon deposit
  beaconDeposits: Array<EthBeaconDeposit>;
}

export interface EthLayer2Stats {
  // layer2 name id: optimism, arbitrum, ...
  layer2: string;

  // total ETH are existing on the layer2
  // count by ETH were being locked in bridge contract on Ethereum blockchain
  totalEthDeposited: string;
}

// query from etherscan api
// https://docs.etherscan.io/api-endpoints/stats-1
export interface EthSupplyStats {
  // total ETH ever exists
  totalSupply: string;

  // total ETH staking rewards
  totalStakingRewards: string;

  // total ETH were burnt
  totalBurnt: string;
}

export interface EthDataTimeframe {
  chain: string;
  protocol: string;
  timestamp: number;
  metric: DataMetric;

  ethPrice: string;

  layer2Stats: Array<EthLayer2Stats>;
}

export interface EthDataState extends EthDataTimeframe {
  supplyStats: EthSupplyStats | null;
}
