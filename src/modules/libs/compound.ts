import CometAbi from '../../configs/abi/compound/Comet.json';
import ComptrollerAbi from '../../configs/abi/compound/Comptroller.json';
import cErc20Abi from '../../configs/abi/compound/cErc20.json';
import CTokensMappings from '../../configs/data/statics/cTokenMappings.json';
import EnvConfig from '../../configs/envConfig';
import { CompoundLendingMarketConfig, Compoundv3LendingMarketConfig } from '../../configs/protocols/compound';
import { normalizeAddress } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { ContractCall } from '../../services/blockchains/domains';
import { Token } from '../../types/configs';

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
      const cTokenAddress = normalizeAddress(cToken);
      if ((CTokensMappings as any)[cTokenAddress]) {
        cTokens.push({
          chain: lendingMarketConfig.chain,
          comptroller: lendingMarketConfig.address,
          cToken: cTokenAddress,
          underlying: (CTokensMappings as any)[cTokenAddress],
        });
      } else {
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
    }

    return cTokens;
  }

  public static async getCometInfo(
    lendingMarketConfig: Compoundv3LendingMarketConfig,
    blockNumber: number,
  ): Promise<CometInfo> {
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
      blockNumber: blockNumber === 0 ? undefined : blockNumber,
    });
    const calls: Array<ContractCall> = [];
    for (let i = 0; i < Number(numAssets); i++) {
      calls.push({
        abi: CometAbi,
        target: lendingMarketConfig.address,
        method: 'getAssetInfo',
        params: [i],
      });
    }

    const assetInfos = await blockchain.multicall({
      chain: lendingMarketConfig.chain,
      calls: calls,
      blockNumber: blockNumber,
    });
    for (const assetInfo of assetInfos) {
      const token = await blockchain.getTokenInfo({
        chain: lendingMarketConfig.chain,
        address: assetInfo.asset.toString(),
      });
      cometInfo.collaterals.push(token as Token);
    }

    return cometInfo;
  }
}
