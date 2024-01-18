import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import { GetAdapterDataOptions, GetStateDataResult } from '../../../types/options';
import ProtocolAdapter from '../adapter';

export default class Compoundv3Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compoundv3';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    const result: GetStateDataResult = {
      data: [],
    };

    // const marketConfig: LendingMarketConfig = options.config as LendingMarketConfig;
    // const blockNumber = await tryQueryBlockNumberAtTimestamp(
    //   EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
    //   options.timestamp,
    // );
    //
    // const cometInfo = await CompoundLibs.getCometInfo(marketConfig);

    return result;
  }
}
