import BigNumber from 'bignumber.js';

import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV3.json';
import AaveIncentiveControllerV3Abi from '../../../configs/abi/aave/IncentiveControllerV3.json';
import AaveLendingPoolV3Abi from '../../../configs/abi/aave/LendingPoolV3.json';
import { SolidityUnits } from '../../../configs/constants';
import { formatBigNumberToString } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Aavev2Adapter, { AaveMarketRates } from './aavev2';
import { Aavev3EventSignatures } from './abis';

export default class Aavev3Adapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.aavev3';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = Aavev3EventSignatures;
    this.abiConfigs.eventAbis = {
      lendingPool: AaveLendingPoolV3Abi,
      dataProvider: AaveDataProviderV3Abi,
      incentiveController: AaveIncentiveControllerV3Abi,
    };
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    return new BigNumber(reserveData[2].toString()).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): {
    stable: string;
    variable: string;
  } {
    return {
      stable: reserveData[3].toString(),
      variable: reserveData[4].toString(),
    };
  }

  protected getMarketRates(reserveData: any): AaveMarketRates {
    return {
      supply: formatBigNumberToString(reserveData[5].toString(), SolidityUnits.RayDecimals),
      borrow: formatBigNumberToString(reserveData[6].toString(), SolidityUnits.RayDecimals),
      borrowStable: formatBigNumberToString(reserveData[7].toString(), SolidityUnits.RayDecimals),
    };
  }
}
