import BigNumber from 'bignumber.js';

import SavingDaiAbi from '../../configs/abi/spark/SavingDai.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceBearingToken } from '../../types/oracles';

export default class OracleLibs {
  public static async getTokenPrice(config: OracleSourceBearingToken, blockNumber: number): Promise<string | null> {
    switch (config.type) {
      // return amount of DAI per sDAI
      case 'savingDai': {
        const blockchain = new BlockchainService();
        const daiAmount = await blockchain.readContract({
          chain: config.chain,
          abi: SavingDaiAbi,
          target: config.address,
          method: 'convertToAssets',
          params: [new BigNumber(1e18).toString(10)],
          blockNumber,
        });

        if (daiAmount) {
          return formatBigNumberToString(daiAmount.toString(), 18);
        }
      }
    }

    return null;
  }
}
