import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './configs';
import { LendingCdpSnapshot, LendingMarketSnapshot } from './domains';
import { GetLendingMarketSnapshotOptions, RunCollectorOptions } from './options';

export interface ContextServices {
  database: IDatabaseService;
  blockchain: IBlockchainService;
  oracle: IOracleService;
}

export interface IProtocolAdapter {
  name: string;
  services: ContextServices;
  config: ProtocolConfig;

  getLendingMarketSnapshots: (
    options: GetLendingMarketSnapshotOptions,
  ) => Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null>;
}

export type CollectorType = 'none' | 'lending';
export interface ICollector {
  name: string;
  type: CollectorType;
  services: ContextServices;

  run: (options: RunCollectorOptions) => Promise<void>;
}
