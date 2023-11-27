import BigNumber from 'bignumber.js';

import SavingDaiAbi from '../../../configs/abi/spark/SavingDai.json';
import { formatFromDecimals } from '../../../lib/utils';
import { OracleSourceBearingToken } from '../../../types/configs';
import BlockchainService from '../../blockchains/blockchain';

export default class OracleLibs {
  public static async getTokenPrice(config: OracleSourceBearingToken, blockNumber: number): Promise<string | null> {
    switch (config.type) {
      // return amount of DAI per sDAI
      case 'savingDai': {
        const blockchain = new BlockchainService();
        const daiAmount = await blockchain.singlecall({
          chain: config.chain,
          abi: SavingDaiAbi,
          target: config.address,
          method: 'convertToAssets',
          params: [new BigNumber(1e18).toString(10)],
          blockNumber,
        });

        if (daiAmount) {
          return formatFromDecimals(daiAmount.toString(), 18);
        }
      }
    }

    return null;
  }
}
