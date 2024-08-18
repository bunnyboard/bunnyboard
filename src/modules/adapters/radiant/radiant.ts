import { ChainNames } from '../../../configs/names';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunAdapterOptions } from '../../../types/options';
import Aavev2Adapter, { ReserveAndPrice } from '../aave/aavev2';
import { Aavev2FlashloanAdapter } from '../aave/flashloan';
import ProtocolAdapter from '../adapter';

class RadiantLendingAdapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.radiant';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getReservesAndPrices(
    config: AaveLendingMarketConfig,
    blockNumber: number,
    timestamp: number,
  ): Promise<Array<ReserveAndPrice>> {
    // there are some issues with radiant oracle config on base
    // before 1719014400
    if (config.chain !== ChainNames.base || (config.chain === ChainNames.base && timestamp >= 1719014400)) {
      return await super.getReservesAndPrices(config, blockNumber, timestamp);
    }

    // get from config oracle sources
    const reserveList = await this.getReservesList(config, blockNumber);
    if (reserveList) {
      const reserveAndPrices: Array<ReserveAndPrice> = [];
      for (const reserve of reserveList) {
        const reservePrice = await this.services.oracle.getTokenPriceUsd({
          chain: config.chain,
          address: reserve,
          timestamp: timestamp,
        });

        reserveAndPrices.push({
          reserve: reserve,
          price: reservePrice ? reservePrice : '0',
        });
      }

      return reserveAndPrices;
    }

    return [];
  }
}

export default class RadiantAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.radiant';

  private aavev2: RadiantLendingAdapter;
  private flashloan: Aavev2FlashloanAdapter;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.aavev2 = new RadiantLendingAdapter(services, storages, protocolConfig);
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
