import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ContractConfig, ProtocolConfig } from './configs';
import { LendingCdpSnapshot, LendingMarketSnapshot } from './domains';
import {
  AdapterAbiConfigs,
  GetLendingMarketSnapshotOptions,
  RunAdapterOptions,
  RunContractLogCollectorOptions,
} from './options';

export interface ContextServices {
  database: IDatabaseService;
  blockchain: IBlockchainService;
  oracle: IOracleService;
}

export interface IContractLogCollector {
  name: string;
  services: ContextServices;
  contracts: Array<ContractConfig>;

  // run all indexing tasks if any
  getContractLogs: (options: RunContractLogCollectorOptions) => Promise<void>;
}

export interface IProtocolAdapter {
  name: string;
  services: ContextServices;

  // protocol config
  config: ProtocolConfig;

  // known contract event log signature
  // and abi for parsing
  abiConfigs: AdapterAbiConfigs;

  // this collector does collect contract event logs
  // of all needed contracts for adapter
  contractLogCollector: IContractLogCollector;

  getLendingMarketSnapshots: (
    options: GetLendingMarketSnapshotOptions,
  ) => Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null>;

  // run updater worker service
  run: (options: RunAdapterOptions) => Promise<void>;
}
