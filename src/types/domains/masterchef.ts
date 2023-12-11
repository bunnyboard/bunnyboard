import { Token } from '../configs';
import {
  AddressBookEntry,
  AddressCountEntry,
  BalanceCountEntry,
  DayDataSnapshot,
  RewardCountEntry,
  TokenRewardEntry,
  VolumeCountEntry,
} from './base';

export interface AddressBookEntryMasterchef extends AddressBookEntry {
  masterchef: string;
  poolId: number;
}

export interface AddressCountEntryMasterchef extends AddressCountEntry {
  depositors: number;
  withdrawers: number;
}

export interface BalanceCountEntryMasterchef extends BalanceCountEntry {
  deposit: string;
}

export interface VolumeCountEntryLending extends VolumeCountEntry {
  deposit: string;
  withdraw: string;
}

export interface RewardCountEntryMasterchef extends RewardCountEntry {
  forStakers: Array<TokenRewardEntry>;
}

export interface MasterchefPoolRates {
  reward: string;
}

export interface MasterchefPoolSnapshot extends DayDataSnapshot {
  // masterchef address
  address: string;

  // pool ID
  poolId: number;

  // deposited token
  token: Token;
  tokenPrice: string;

  // allocation point
  allocationPoint: number;

  // total lp token were deposited in the period of snapshot
  balances: BalanceCountEntryMasterchef;
  volumes: VolumeCountEntryLending;
  rewards: RewardCountEntryMasterchef;
  addressCount: AddressCountEntryMasterchef;
  rates: MasterchefPoolRates;
}
