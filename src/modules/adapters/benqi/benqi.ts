import BigNumber from 'bignumber.js';

import qiTokenAbi from '../../../configs/abi/benqi/qiToken.json';
import { TimeUnits } from '../../../configs/constants';
import { formatBigNumberToString } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundWithOracleAdapter from '../compound/compoundWithOracle';

interface Rates {
  supplyRate: string;
  borrowRate: string;
}

export default class BenqiAdapter extends CompoundWithOracleAdapter {
  public readonly name: string = 'adapter.benqi';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getMarketRates(chain: string, cTokenContract: string, blockNumber: number): Promise<Rates> {
    const [supplyRatePerTimestamp, borrowRatePerTimestamp] = await this.services.blockchain.multicall({
      chain: chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: qiTokenAbi,
          target: cTokenContract,
          method: 'supplyRatePerTimestamp',
          params: [],
        },
        {
          abi: qiTokenAbi,
          target: cTokenContract,
          method: 'borrowRatePerTimestamp',
          params: [],
        },
      ],
    });

    const supplyRate = new BigNumber(supplyRatePerTimestamp ? supplyRatePerTimestamp : '0').multipliedBy(
      TimeUnits.SecondsPerYear,
    );
    const borrowRate = new BigNumber(borrowRatePerTimestamp ? borrowRatePerTimestamp : '0').multipliedBy(
      TimeUnits.SecondsPerYear,
    );

    return {
      supplyRate: formatBigNumberToString(supplyRate.toString(10), 18),
      borrowRate: formatBigNumberToString(borrowRate.toString(10), 18),
    };
  }
}
