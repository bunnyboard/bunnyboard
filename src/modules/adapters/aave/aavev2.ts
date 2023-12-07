import BigNumber from 'bignumber.js';

import AaveDataProviderV2Abi from '../../../configs/abi/aave/DataProviderV2.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import Aavev1Adapter from './aavev1';
import { AaveV2EventSignatures, Aavev2EventAbiMappings } from './abis';

export default class Aavev2Adapter extends Aavev1Adapter {
  public readonly name: string = 'adapter.aavev2';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = AaveV2EventSignatures;
    this.abiConfigs.eventAbiMappings = Aavev2EventAbiMappings;
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalStableDebt.toString()).plus(
      new BigNumber(reserveData.totalVariableDebt.toString()),
    );
    return new BigNumber(reserveData.availableLiquidity.toString()).plus(totalBorrowed).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalStableDebt.toString()).plus(
      new BigNumber(reserveData.totalVariableDebt.toString()),
    );

    return totalBorrowed.toString(10);
  }

  protected async getReservesList(config: AaveLendingMarketConfig, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveLendingPoolV2Abi,
      target: config.address,
      method: 'getReservesList',
      params: [],
      blockNumber,
    });
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveDataProviderV2Abi,
      target: config.dataProvider,
      method: 'getReserveData',
      params: [reserve],
      blockNumber,
    });
  }
}
