import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { ProtocolConfig } from '../../types/configs';
import { LendingCdpSnapshot, LendingMarketSnapshot, MasterchefPoolSnapshot } from '../../types/domains';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import { AdapterAbiConfigs, GetLendingMarketSnapshotOptions, GetMasterchefSnapshotOptions } from '../../types/options';
import Booker from './booker';

export interface GetDayContractLogsOptions {
  chain: string;
  address: string;
  topics: Array<string>;
  dayStartTimestamp: number;
}

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly config: ProtocolConfig;
  public readonly abiConfigs: AdapterAbiConfigs;
  public readonly booker: Booker;

  constructor(services: ContextServices, config: ProtocolConfig) {
    this.services = services;
    this.config = config;
    this.booker = new Booker(services);

    this.abiConfigs = {
      eventSignatures: {},
      eventAbiMappings: {},
    };
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    return [];
  }

  public async getMasterchefSnapshots(
    options: GetMasterchefSnapshotOptions,
  ): Promise<Array<MasterchefPoolSnapshot> | null> {
    return [];
  }

  protected async getDayContractLogs(options: GetDayContractLogsOptions): Promise<Array<any>> {
    let logs: Array<any> = [];

    const dayStartBlock = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.chain].blockSubgraph,
      options.dayStartTimestamp,
    );
    const dayEndBLock = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.chain].blockSubgraph,
      options.dayStartTimestamp + DAY - 1,
    );

    if (dayStartBlock && dayEndBLock) {
      logger.info('getting contract logs', {
        service: this.name,
        chain: options.chain,
        address: options.address,
        topics: options.topics.length,
        fromBlock: dayStartBlock,
        toBlock: dayEndBLock,
      });

      for (const topic of options.topics) {
        logs = logs.concat(
          await this.services.blockchain.getContractLogs({
            chain: options.chain,
            address: options.address,
            fromBlock: dayStartBlock,
            toBlock: dayEndBLock,
            topics: [topic],
          }),
        );
      }
    }

    return logs;
  }
}
