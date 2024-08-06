import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { DataMetrics, LendingMarketVersions, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunAdapterOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import Aavev2Adapter from './aavev2';
import Aavev3Adapter from './aavev3';
import { Aavev2FlashloanAdapter, Aavev3FlashloanAdapter } from './flashloan';
import AaveStakingAdapter from './staking';

export default class AaveAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.aave 👻';

  private readonly adapter2: Aavev2Adapter;
  private readonly adapter3: Aavev3Adapter;
  private readonly staking: AaveStakingAdapter;
  private readonly flashloan2: Aavev2FlashloanAdapter;
  private readonly flashloan3: Aavev3FlashloanAdapter;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.adapter2 = new Aavev2Adapter(services, storages, protocolConfig);
    this.adapter3 = new Aavev3Adapter(services, storages, protocolConfig);
    this.staking = new AaveStakingAdapter(services, storages, protocolConfig);
    this.flashloan2 = new Aavev2FlashloanAdapter(services, storages, protocolConfig);
    this.flashloan3 = new Aavev3FlashloanAdapter(services, storages, protocolConfig);
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    switch (options.metricConfig.metric) {
      case DataMetrics.crossLending: {
        if ((options.metricConfig as AaveLendingMarketConfig).version === LendingMarketVersions.cross.aavev2) {
          await this.adapter2.run(options);
        } else if ((options.metricConfig as AaveLendingMarketConfig).version === LendingMarketVersions.cross.aavev3) {
          await this.adapter3.run(options);
        }
        break;
      }
      case DataMetrics.staking: {
        await this.staking.run(options);
        break;
      }
      case DataMetrics.flashloan: {
        if ((options.metricConfig as AaveLendingMarketConfig).version === LendingMarketVersions.cross.aavev2) {
          await this.flashloan2.run(options);
        } else if ((options.metricConfig as AaveLendingMarketConfig).version === LendingMarketVersions.cross.aavev3) {
          await this.flashloan3.run(options);
        }
        break;
      }
    }
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    if (options.metricConfig.metric === DataMetrics.crossLending) {
      await this.adapter3.runTest(options);
    }
  }
}
