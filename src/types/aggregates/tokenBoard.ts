import { DataTimeframe } from '../collectors/base';
import { Token } from '../configs';
import { DataValue } from './common';

export interface AggTokenBoardErc20Snapshot extends Token, DataTimeframe {
  tokenPrice: DataValue;

  // defined by token/protocol/project itself
  stablecoin: boolean;

  // total supply returned from smart contract
  totalSupply: DataValue;

  // totalSupply * tokenPrice
  fullDilutedValuation: DataValue;

  volumeTransfer: DataValue;
  volumeMint: DataValue;
  volumeBurn: DataValue;
  volumeOnDex: DataValue;

  // current number of active holders
  // addresses have balance changes
  numberOfActiveHolders: DataValue;
}

export interface AggTokenBoardErc20DayData {
  timestamp: number;
  tokenPrice: number;
  totalSupply: number;
  fullDilutedValuation: number;
  volumeTransfer: number;
  volumeMint: number;
  volumeBurn: number;
  volumeOnDex: number;
  numberOfActiveHolders: number;
}

export interface AggTokenBoardErc20DataOverall extends AggTokenBoardErc20Snapshot {
  dayData: Array<AggTokenBoardErc20DayData>;
}
