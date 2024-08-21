import axios from 'axios';
import envConfig from '../../configs/envConfig';

const chainMaps: { [key: string]: string } = {
  ethereum: 'https://eth-mainnet.g.alchemy.com/v2',
};

export default class AlchemyLibs {
  // https://docs.alchemy.com/reference/alchemy-gettransactionreceipts
  public static async getBlockTransactionReceipts(chain: string, blockNumber: number): Promise<any> {
    if (chainMaps[chain]) {
      const response = await axios.post(`${chainMaps[chain]}/${envConfig.externalConfigs.alchemyAppKey}`, {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTransactionReceipts',
        params: [
          {
            blockNumber: `0x${blockNumber.toString(16)}`,
          },
        ],
      });
      if (response && response.data) {
        return response.data.result.receipts;
      }
    }

    return null;
  }
}
