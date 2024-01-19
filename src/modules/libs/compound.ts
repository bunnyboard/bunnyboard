import CometAbi from '../../configs/abi/compound/Comet.json';
import ComptrollerAbi from '../../configs/abi/compound/Comptroller.json';
import cErc20Abi from '../../configs/abi/compound/cErc20.json';
import EnvConfig from '../../configs/envConfig';
import { CompoundLendingMarketConfig } from '../../configs/protocols/compound';
import { normalizeAddress } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { CdpLendingMarketConfig, Token } from '../../types/configs';

interface CTokenInfo {
  chain: string;
  cToken: string;
  comptroller: string;
  underlying: Token;
}

interface CometInfo {
  chain: string;
  address: string;
  baseToken: Token;
  collaterals: Array<Token>;
}

export default class CompoundLibs {
  public static async getComptrollerInfo(lendingMarketConfig: CompoundLendingMarketConfig): Promise<Array<CTokenInfo>> {
    const cTokens: Array<CTokenInfo> = [];
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
          cTokens.push({
            chain: lendingMarketConfig.chain,
            comptroller: lendingMarketConfig.address,
            cToken: normalizeAddress(cToken.toString()),
            underlying: token,
          });
        }
      } else {
        cTokens.push({
          chain: lendingMarketConfig.chain,
          comptroller: lendingMarketConfig.address,
          cToken: normalizeAddress(cToken.toString()),
          underlying: EnvConfig.blockchains[lendingMarketConfig.chain].nativeToken,
        });
      }
    }

    return cTokens;
  }

  public static async getCometInfo(lendingMarketConfig: CdpLendingMarketConfig): Promise<CometInfo> {
    const cometInfo: CometInfo = {
      chain: lendingMarketConfig.chain,
      address: lendingMarketConfig.address,
      baseToken: lendingMarketConfig.debtToken as Token,
      collaterals: [],
    };

    const blockchain = new BlockchainService();
    const numAssets = await blockchain.readContract({
      chain: lendingMarketConfig.chain,
      abi: CometAbi,
      target: lendingMarketConfig.address,
      method: 'numAssets',
      params: [],
    });
    for (let i = 0; i < Number(numAssets); i++) {
      const assetInfo = await blockchain.readContract({
        chain: lendingMarketConfig.chain,
        abi: CometAbi,
        target: lendingMarketConfig.address,
        method: 'getAssetInfo',
        params: [i],
      });
      const token = await blockchain.getTokenInfo({
        chain: lendingMarketConfig.chain,
        address: assetInfo.asset.toString(),
      });
      cometInfo.collaterals.push(token as Token);
    }

    return cometInfo;
  }
}
