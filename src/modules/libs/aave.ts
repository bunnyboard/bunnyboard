import AaveLendingPoolAbiV2 from '../../configs/abi/aave/LendingPoolV2.json';
import AaveLendingPoolAbiV3 from '../../configs/abi/aave/LendingPoolV3.json';
import { AaveLendingMarketConfig } from '../../configs/protocols/aave';
import BlockchainService from '../../services/blockchains/blockchain';
import { Token } from '../../types/configs';

export default class AaveLibs {
  public static async getMarketReserves(lendingMarketConfig: AaveLendingMarketConfig): Promise<Array<Token>> {
    const tokens: Array<Token> = [];
    const blockchain = new BlockchainService();

    const reserveList = await blockchain.readContract({
      chain: lendingMarketConfig.chain,
      abi: lendingMarketConfig.version === 'aavev2' ? AaveLendingPoolAbiV2 : AaveLendingPoolAbiV3,
      target: lendingMarketConfig.address,
      method: 'getReservesList',
      params: [],
    });
    for (const reserve of reserveList) {
      const token = await blockchain.getTokenInfo({
        chain: lendingMarketConfig.chain,
        address: reserve,
        onchain: true,
      });
      if (token) {
        tokens.push(token);
      }
    }

    return tokens;
  }
}
