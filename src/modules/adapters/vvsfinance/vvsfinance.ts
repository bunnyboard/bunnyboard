import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Uniswapv2Adapter from '../uniswap/uniswapv2';

export default class VvsfinanceAdapter extends Uniswapv2Adapter {
  public readonly name: string = 'adapter.vvsfinance';

  protected readonly testPairs: any = {
    cronos: '0x3d2180db9e1b909f35c398bc39ef36108c0fc8c3',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
