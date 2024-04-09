import CurveMetaPoolAbi from '../../configs/abi/curve/MetaPool.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceCurveMetaPool } from '../../types/oracles';

interface GetMetaPoolPriceOptions {
  config: OracleSourceCurveMetaPool;
  blockNumber: number;
}

export default class CurveLibs {
  public static async getMetaPoolPrice(options: GetMetaPoolPriceOptions): Promise<string | null> {
    const blockchain = new BlockchainService();
    const price = await blockchain.readContract({
      chain: options.config.chain,
      abi: CurveMetaPoolAbi,
      target: options.config.address,
      method: 'get_virtual_price',
      params: [],
      blockNumber: options.blockNumber,
    });
    if (price) {
      return formatBigNumberToString(price.toString(), options.config.baseToken.decimals);
    } else {
      return null;
    }
  }
}
