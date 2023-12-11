import { Token } from '../configs';

// lending -> lending protocols
// farming -> masterchef or reward yield farming based protocols
export type ProtocolSector = 'lending' | 'masterchef' | 'staking';

export type AddressRoleLending = 'lender' | 'borrower' | 'liquidator';
export type AddressRoleStaking = 'staker';

export interface AddressBookEntry {
  chain: string;
  protocol: string;
  address: string;

  sector: ProtocolSector;
  role: AddressRoleLending | AddressRoleStaking;

  // timestamp where the first transaction
  // was made by this address to using this protocol
  firstTime: number;
}

export interface TokenRewardEntry {
  token: Token;
  tokenPrice: string;
  tokenAmount: string;
}

export interface AddressCountEntry {
  [key: string]: number;
}

export interface VolumeCountEntry {
  [key: string]: string;
}

export interface BalanceCountEntry {
  [key: string]: string;
}

export interface RewardCountEntry {
  [key: string]: Array<TokenRewardEntry>;
}

export interface DayDataSnapshot {
  // the protocol id
  protocol: string;

  // chain where data was collected
  chain: string;

  // StartDayTimestamp
  // historical data was query at the StartDayTimestamp
  // volumes were count from the StartDayTimestamp to EndDayTimestamp - 1
  timestamp: number;

  balances: BalanceCountEntry;

  volumes: VolumeCountEntry;

  rewards: RewardCountEntry;

  addressCount: AddressCountEntry;

  transactionCount: number;
}
