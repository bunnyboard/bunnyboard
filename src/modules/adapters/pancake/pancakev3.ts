import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Uniswapv3Adapter from '../uniswap/uniswapv3';

export default class Pancakev3Adapter extends Uniswapv3Adapter {
  public readonly name: string = 'adapter.pancake 🥞';

  protected readonly testPairs: any = {
    bnbchain: '0x36696169c63e42cd08ce11f5deebbcebae652050',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
