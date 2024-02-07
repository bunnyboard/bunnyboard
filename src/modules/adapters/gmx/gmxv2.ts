import ReaderAbi from '../../../configs/abi/gmx/ReaderV2.json';
import EnvConfig from '../../../configs/envConfig';
import { Gmxv2PerpetualMarketConfig } from '../../../configs/protocols/gmx';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { GetAdapterDataStateOptions, GetAdapterDataStateResult } from '../../../types/collectors/options';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import ProtocolAdapter from '../adapter';
import { GmxEventSignatures } from './abis';

export default class Gmxv2Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.gmxv2';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = GmxEventSignatures;
    this.abiConfigs.eventAbis = {
      reader: ReaderAbi,
    };
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<GetAdapterDataStateResult> {
    const result: GetAdapterDataStateResult = {
      perpetual: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig: Gmxv2PerpetualMarketConfig = options.config as Gmxv2PerpetualMarketConfig;

    const marketInfo = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.reader,
      target: marketConfig.reader,
      method: 'getMarketInfo',
      params: [
        marketConfig.dataStore,
        [
          ['430870195778100000000000000', '430871771228700000000000000'],
          ['430870195778100000000000000', '430871771228700000000000000'],
          ['1000100000000000000000000', '1000184500000000000000000'],
        ],
        '0x47c031236e19d024b42f8AE6780E44A573170703',
      ],
      blockNumber: blockNumber,
    });

    console.log(marketInfo);

    return result;
  }
}
