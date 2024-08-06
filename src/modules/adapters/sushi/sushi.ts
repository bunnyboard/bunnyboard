import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunAdapterOptions } from '../../../types/options';
import StakingProtocolAdapter from '../staking';
import xSushiAdapter from './xsushi';
import Uniswapv2Adapter from '../uniswap/uniswapv2';
import Uniswapv3Adapter from '../uniswap/uniswapv3';

class Sushiv2DexAdapter extends Uniswapv2Adapter {
  public readonly name: string = 'adapter.sushi 🍣';

  protected readonly testPairs: any = {
    ethereum: '0x795065dcc9f64b5614c407a6efdc400da6221fb0',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}

class Sushiv3DexAdapter extends Uniswapv3Adapter {
  public readonly name: string = 'adapter.sushi 🍣';

  protected readonly testPairs: any = {
    ethereum: '0xfa6e8e97ececdc36302eca534f63439b1e79487b',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}

export default class SushiAdapter extends StakingProtocolAdapter {
  public readonly name: string = 'adapter.sushi 🍣';

  private sushiDexV2: Sushiv2DexAdapter;
  private sushiDexV3: Sushiv3DexAdapter;
  private xsushi: xSushiAdapter;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.sushiDexV2 = new Sushiv2DexAdapter(services, storages, protocolConfig);
    this.sushiDexV3 = new Sushiv3DexAdapter(services, storages, protocolConfig);
    this.xsushi = new xSushiAdapter(services, storages, protocolConfig);
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    switch (options.metricConfig.metric) {
      case DataMetrics.dex: {
        if ((options.metricConfig as DexConfig).version === DexVersions.univ2) {
          await this.sushiDexV2.run(options);
        } else if ((options.metricConfig as DexConfig).version === DexVersions.univ3) {
          await this.sushiDexV3.run(options);
        }
        break;
      }
      case DataMetrics.staking: {
        await this.xsushi.run(options);
        break;
      }
    }
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    if ((options.metricConfig as DexConfig).version === DexVersions.univ2) {
      await this.sushiDexV2.runTest(options);
    } else if ((options.metricConfig as DexConfig).version === DexVersions.univ3) {
      await this.sushiDexV3.runTest(options);
    }
  }
}
