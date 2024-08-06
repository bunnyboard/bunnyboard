import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Uniswapv2Adapter from '../uniswap/uniswapv2';

export default class PancakeAdapter extends Uniswapv2Adapter {
  public readonly name: string = 'adapter.pancake 🥞';

  protected readonly testPairs: any = {
    bnbchain: '0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
