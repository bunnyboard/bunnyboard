import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunAdapterOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import BalancerFlashloanAdapter from './flashloan';

export default class BalancerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.balancer ⚖';

  private flashloan: BalancerFlashloanAdapter;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.flashloan = new BalancerFlashloanAdapter(services, storages, protocolConfig);
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    switch (options.metricConfig.metric) {
      case DataMetrics.flashloan: {
        await this.flashloan.run(options);
        break;
      }
    }
  }
}
