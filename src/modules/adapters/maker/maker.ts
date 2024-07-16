import { getTimestamp } from '../../../lib/utils';
import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunAdapterOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import MakerCdpAdapter from './cdp';
import MakerFlashloanAdapter from './flashloan';

export default class MakerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.maker';

  private cdp: MakerCdpAdapter;
  private flashloan: MakerFlashloanAdapter;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.cdp = new MakerCdpAdapter(services, storages, protocolConfig);
    this.flashloan = new MakerFlashloanAdapter(services, storages, protocolConfig);
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    switch (options.metricConfig.metric) {
      case DataMetrics.cdpLending: {
        await this.cdp.run(options);
        break;
      }
      case DataMetrics.flashloan: {
        await this.flashloan.run(options);
        break;
      }
    }
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    const currentTime = getTimestamp();
    const last24Hours = currentTime - 24 * 60 * 60;
    console.log(
      JSON.stringify(
        await this.flashloan.getFlashloanDataTimeframe({
          config: options.metricConfig,
          fromTime: last24Hours,
          toTime: currentTime,
          latestState: true,
        }),
      ),
    );
  }
}
