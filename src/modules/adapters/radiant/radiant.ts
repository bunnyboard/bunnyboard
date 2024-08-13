import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunAdapterOptions } from '../../../types/options';
import Aavev2Adapter from '../aave/aavev2';
import { Aavev2FlashloanAdapter } from '../aave/flashloan';
import ProtocolAdapter from '../adapter';

export default class RadiantAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.radiant';

  private aavev2: Aavev2Adapter;
  private flashloan: Aavev2FlashloanAdapter;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.aavev2 = new Aavev2Adapter(services, storages, protocolConfig);
    this.flashloan = new Aavev2FlashloanAdapter(services, storages, protocolConfig);
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    switch (options.metricConfig.metric) {
      case DataMetrics.crossLending: {
        await this.aavev2.run(options);
        break;
      }
      case DataMetrics.flashloan: {
        await this.flashloan.run(options);
        break;
      }
    }
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    switch (options.metricConfig.metric) {
      case DataMetrics.crossLending: {
        await this.aavev2.runTest(options);
        break;
      }
      case DataMetrics.flashloan: {
        await this.flashloan.runTest(options);
        break;
      }
    }
  }
}
