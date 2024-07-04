import BigNumber from 'bignumber.js';
import CurveMetaPoolAbi from '../../configs/abi/curve/MetaPool.json';
import CurveStablePoolAbi from '../../configs/abi/curve/CurveStableSwapNG.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceCurvePool } from '../../types/oracles';

interface GetMetaPoolPriceOptions {
  config: OracleSourceCurvePool;
  blockNumber: number;
}

export default class CurveLibs {
  public static async getCurvePoolPrice(options: GetMetaPoolPriceOptions): Promise<string | null> {
    const blockchain = new BlockchainService();

    const price = await blockchain.readContract({
      chain: options.config.chain,
      abi: options.config.type === 'curveMetaPool' ? CurveMetaPoolAbi : CurveStablePoolAbi,
      target: options.config.address,
      method: options.config.type === 'curveMetaPool' ? 'get_dy_underlying' : 'get_dy',
      params: [
        options.config.baseTokenIndex,
        options.config.quotaTokenIndex,
        new BigNumber(1).multipliedBy(new BigNumber(10).pow(options.config.baseToken.decimals)).toString(10),
      ],
      blockNumber: options.blockNumber,
    });

    if (price) {
      return formatBigNumberToString(price.toString(), options.config.quotaToken.decimals);
    } else {
      return null;
    }
  }
}
