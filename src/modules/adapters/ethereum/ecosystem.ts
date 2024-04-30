import { ContextServices, ContextStorages } from '../../../types/namespaces';

// import { EthereumEcosystemConfig } from '../../../configs/boards/ethereum';
// import { ChainNames } from '../../../configs/names';

export interface IEthereumEcosystemAdapter {
  name: string;

  services: ContextServices;
  storages: ContextStorages;
}

export interface RunEthereumEcosystemAdapterProps {
  fromBlock: number;
  force: boolean;
}

export default class EthereumEcosystemAdapter implements IEthereumEcosystemAdapter {
  public readonly name: string = 'ethereum';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  constructor(services: ContextServices, storages: ContextStorages) {
    this.services = services;
    this.storages = storages;
  }

  // public async getEcosystemSnapshot(config: EthereumEcosystemConfig, timestamp: number): Promise<any> {
  //   const rpcClient = this.services.blockchain.getPublicClient(ChainNames.ethereum);
  // }

  public async run(options: RunEthereumEcosystemAdapterProps): Promise<void> {}
}
