import BigNumber from 'bignumber.js';

import VatAbi from '../../configs/abi/maker/Vat.json';
import SavingDaiAbi from '../../configs/abi/spark/SavingDai.json';
import { SolidityUnits } from '../../configs/constants';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceMakerRwaPip, OracleSourceSavingDai } from '../../types/oracles';

export default class OracleLibs {
  public static async getTokenPrice(
    config: OracleSourceSavingDai | OracleSourceMakerRwaPip,
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
        config = config as OracleSourceMakerRwaPip;
        const blockchain = new BlockchainService();
        const vatInfo = await blockchain.readContract({
          chain: config.chain,
          abi: VatAbi,
          target: config.address,
          method: 'ilks',
          params: [config.ilk],
          blockNumber,
        });
        if (vatInfo) {
          const art = new BigNumber(vatInfo[0].toString());
          const rate = new BigNumber(vatInfo[1].toString());
          return formatBigNumberToString(
            art.multipliedBy(rate).toString(10),
            SolidityUnits.RayDecimals + SolidityUnits.WadDecimals,
          );
        }

        break;
      }
    }

    return null;
  }
}
