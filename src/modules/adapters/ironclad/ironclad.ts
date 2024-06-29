import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunAdapterOptions } from '../../../types/options';
import Aavev2Adapter from '../aave/aavev2';
import { Aavev2FlashloanAdapter } from '../aave/flashloan';
import ProtocolAdapter from '../adapter';

export default class IroncladAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.ironclad';

  private readonly adapter2: Aavev2Adapter;
  private readonly flashloan2: Aavev2FlashloanAdapter;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.adapter2 = new Aavev2Adapter(services, storages, protocolConfig);
    this.flashloan2 = new Aavev2FlashloanAdapter(services, storages, protocolConfig);
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    switch (options.metricConfig.metric) {
      case DataMetrics.crossLending: {
        await this.adapter2.run(options);
        break;
      }
      case DataMetrics.flashloan: {
        await this.flashloan2.run(options);
        break;
      }
    }
  }
}
