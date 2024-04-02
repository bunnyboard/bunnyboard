import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Uniswapv3Adapter from '../uniswap/uniswapv3';

export default class Sushiv3Adapter extends Uniswapv3Adapter {
  public readonly name: string = 'adapter.sushiv3';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
