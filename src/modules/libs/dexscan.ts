import { DexscanConfigs } from '../../configs/boards/dexscan';
import { DexLiquidityTokenSnapshot } from '../../types/collectors/dexscan';
import { Token } from '../../types/configs';
import UniswapLibs from './uniswap';

export default class DexscanLibs {
  public static async scanLiquidityTokenData(
    token: Token,
    fromBlock: number,
    toBlock: number,
  ): Promise<Array<DexLiquidityTokenSnapshot>> {
    const data: Array<DexLiquidityTokenSnapshot> = [];
    for (const dexConfig of DexscanConfigs) {
      const tokenData = await UniswapLibs.getLiquidityTokenSnapshot({
        dexConfig: dexConfig,
        token: token,
        fromBlock: fromBlock,
        toBlock: toBlock,
      });
      if (tokenData) {
        data.push(tokenData);
      }
    }

    return data;
  }
}
