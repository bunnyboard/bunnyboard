import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Uniswapv2Adapter from '../uniswap/uniswapv2';

export default class KatanaAdapter extends Uniswapv2Adapter {
  public readonly name: string = 'adapter.katana 🗡';

  protected readonly testPairs: any = {
    ronin: '0x8f1c5eda143fa3d1bea8b4e92f33562014d30e0d',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
