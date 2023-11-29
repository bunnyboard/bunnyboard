import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { queryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { ProtocolConfig } from '../../types/configs';
import { LendingMarketSnapshot } from '../../types/domains';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../types/options';

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

  constructor(services: ContextServices, config: ProtocolConfig) {
    this.services = services;
    this.config = config;
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
      for (const topic of options.topics) {
        if (topic !== '') {
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
    }

    return logs;
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot> | null> {
    return [];
  }
}
