import BigNumber from 'bignumber.js';

import PipAbi from '../../configs/abi/maker/Pip.json';
import SavingDaiAbi from '../../configs/abi/spark/SavingDai.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceBearingToken, OracleSourceMakerRwaPip } from '../../types/oracles';

export default class OracleLibs {
  public static async getTokenPrice(
    config: OracleSourceBearingToken | OracleSourceMakerRwaPip,
    blockNumber: number,
  ): Promise<string | null> {
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

        break;
      }
      case 'makerRwaPip': {
        const blockchain = new BlockchainService();
        const result = await blockchain.readContract({
          chain: config.chain,
          abi: PipAbi,
          target: config.address,
          method: 'read',
          params: [],
          blockNumber,
        });
        if (result) {
          return formatBigNumberToString(new BigNumber(result.toString(), 16).toString(10), 18);
        }

        break;
      }
    }

    return null;
  }
}
