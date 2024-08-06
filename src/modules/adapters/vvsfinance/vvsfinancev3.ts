import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Uniswapv3Adapter from '../uniswap/uniswapv3';

export default class Vvsfinancev3Adapter extends Uniswapv3Adapter {
  public readonly name: string = 'adapter.vvsfinancev3';

  protected readonly testPairs: any = {
    cronos: '0xca4e9ca81f5c8f50e1385a88aa02ca106c21e6b2',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
