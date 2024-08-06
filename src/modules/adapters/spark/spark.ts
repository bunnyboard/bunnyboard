import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunAdapterOptions } from '../../../types/options';
import Aavev3Adapter from '../aave/aavev3';
import { Aavev3FlashloanAdapter } from '../aave/flashloan';
import ProtocolAdapter from '../adapter';

export default class SparkAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.spark ⚡';

  private aave: Aavev3Adapter;
  private flashloan: Aavev3FlashloanAdapter;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.aave = new Aavev3Adapter(services, storages, protocolConfig);
    this.flashloan = new Aavev3FlashloanAdapter(services, storages, protocolConfig);
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    switch (options.metricConfig.metric) {
      case DataMetrics.crossLending: {
        await this.aave.run(options);
        break;
      }
      case DataMetrics.flashloan: {
        await this.flashloan.run(options);
        break;
      }
    }
  }
}
