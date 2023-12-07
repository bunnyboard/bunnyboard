import BigNumber from 'bignumber.js';

import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV3.json';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import Aavev2Adapter from './aavev2';
import { AaveV3EventSignatures, Aavev3EventAbiMappings } from './abis';

export default class Aavev3Adapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.aavev3';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = AaveV3EventSignatures;
    this.abiConfigs.eventAbiMappings = Aavev3EventAbiMappings;
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveDataProviderV3Abi,
      target: config.dataProvider,
      method: 'getReserveData',
      params: [reserve],
      blockNumber,
    });
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    return new BigNumber(reserveData.totalAToken.toString()).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalStableDebt.toString()).plus(
      new BigNumber(reserveData.totalVariableDebt.toString()),
    );

    return totalBorrowed.toString(10);
  }
}
