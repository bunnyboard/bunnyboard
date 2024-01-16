import ComptrollerAbi from '../../configs/abi/compound/Comptroller.json';
import cErc20Abi from '../../configs/abi/compound/cErc20.json';
import { CompoundLendingMarketConfig } from '../../configs/protocols/compound';
import BlockchainService from '../../services/blockchains/blockchain';
import { Token } from '../../types/configs';

export default class CompoundLibs {
  public static async getComptrollerTokens(lendingMarketConfig: CompoundLendingMarketConfig): Promise<Array<Token>> {
    const tokens: Array<Token> = [];
    const blockchain = new BlockchainService();

    const allMarkets = await blockchain.readContract({
      chain: lendingMarketConfig.chain,
      abi: ComptrollerAbi,
      target: lendingMarketConfig.address,
      method: 'getAllMarkets',
      params: [],
    });
    for (const cToken of allMarkets) {
      const underlying = await blockchain.readContract({
        chain: lendingMarketConfig.chain,
        abi: cErc20Abi,
        target: cToken,
        method: 'underlying',
        params: [],
      });
      if (underlying) {
        const token = await blockchain.getTokenInfo({
          chain: lendingMarketConfig.chain,
          address: underlying,
          onchain: true,
        });
        if (token) {
          tokens.push(token);
        }
      }
    }

    return tokens;
  }
}
