import AaveLendingPoolAbiV2 from '../../configs/abi/aave/LendingPoolV2.json';
import AaveLendingPoolAbiV3 from '../../configs/abi/aave/LendingPoolV3.json';
import { AaveLendingMarketConfig } from '../../configs/protocols/aave';
import BlockchainService from '../../services/blockchains/blockchain';
import { LendingMarketVersions, Token } from '../../types/configs';

export interface AaveMarketInfo {
  chain: string;
  lendingPool: string;
  dataProvider: string;
  incentiveController: string;

  // a list of reserves tokens
  reserves: Array<Token>;
}

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

  public static async getMarketInfo(aaveLendingMarketConfig: AaveLendingMarketConfig): Promise<AaveMarketInfo | null> {
    const reserves: Array<Token> = [];
    const blockchain = new BlockchainService();

    const reserveList = await blockchain.readContract({
      chain: aaveLendingMarketConfig.chain,
      abi:
        aaveLendingMarketConfig.version === LendingMarketVersions.cross.aavev2
          ? AaveLendingPoolAbiV2
          : AaveLendingPoolAbiV3,
      target: aaveLendingMarketConfig.address,
      method: 'getReservesList',
      params: [],
    });

    console.log(aaveLendingMarketConfig, reserveList);

    for (const reserve of reserveList) {
      const token = await blockchain.getTokenInfo({
        chain: aaveLendingMarketConfig.chain,
        address: reserve,
        onchain: true,
      });
      if (token) {
        reserves.push(token);
      }
    }

    return {
      chain: aaveLendingMarketConfig.chain,
      lendingPool: aaveLendingMarketConfig.address,
      dataProvider: aaveLendingMarketConfig.dataProvider,
      incentiveController: aaveLendingMarketConfig.incentiveController,
      reserves: reserves,
    };
  }
}
