import axios from 'axios';
import envConfig from '../../configs/envConfig';
import { formatBigNumberToString } from '../../lib/utils';

interface EthSupply {
  totalSupply: string;
  totalStakingRewards: string;
  totalBurnt: string;
}

export default class EtherscanLibs {
  public static async getEthSupply(): Promise<EthSupply | null> {
    try {
      const response = await axios.get(
        `https://api.etherscan.io/api?module=stats&action=ethsupply2&apikey=${envConfig.externalConfigs.etherscanApiKey}`,
      );
      if (response && response.data && response.data.result) {
        return {
          totalSupply: formatBigNumberToString(response.data.result.EthSupply.toString(), 18),
          totalStakingRewards: formatBigNumberToString(response.data.result.Eth2Staking.toString(), 18),
          totalBurnt: formatBigNumberToString(response.data.result.BurntFees.toString(), 18),
        };
      }
    } catch (e: any) {
      console.log(e);
    }

    return null;
  }
}
