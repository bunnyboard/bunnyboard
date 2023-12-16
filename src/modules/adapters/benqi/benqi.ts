import BigNumber from 'bignumber.js';

import qiTokenAbi from '../../../configs/abi/benqi/qiToken.json';
import { YEAR } from '../../../configs/constants';
import { formatFromDecimals } from '../../../lib/utils';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import CompoundAdapter, { CompoundMarketRates } from '../compound/compound';

export default class BenqiAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.benqi';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
  }

  protected async getMarketRates(config: LendingMarketConfig, blockNumber: number): Promise<CompoundMarketRates> {
    const supplyRatePerTimestamp = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: qiTokenAbi,
      target: config.address,
      method: 'supplyRatePerTimestamp',
      params: [],
      blockNumber,
    });
    const borrowRatePerTimestamp = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: qiTokenAbi,
      target: config.address,
      method: 'borrowRatePerTimestamp',
      params: [],
      blockNumber,
    });

    const supplyRate = new BigNumber(supplyRatePerTimestamp ? supplyRatePerTimestamp : '0').multipliedBy(
      Math.floor(YEAR),
    );
    const borrowRate = new BigNumber(borrowRatePerTimestamp ? borrowRatePerTimestamp : '0').multipliedBy(
      Math.floor(YEAR),
    );

    return {
      supplyRate: formatFromDecimals(supplyRate.toString(10), 18),
      borrowRate: formatFromDecimals(borrowRate.toString(10), 18),
    };
  }
}
