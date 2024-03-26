import EnvConfig from '../../../../configs/envConfig';
import { IDatabaseService } from '../../../../services/database/domains';
import { AggDexLiquidityPoolSnapshot, AggDexLiquidityTokenSnapshot } from '../../../../types/aggregates/dexscan';
import BaseDataAggregator from '../../base';
import DexscanDataTransformer from './transform';

export default class DexscanDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.dexscan';

  constructor(database: IDatabaseService) {
    super(database);
  }

  public async getLiquidityTokenSnapshots(
    chain: string,
    address: string,
  ): Promise<Array<AggDexLiquidityTokenSnapshot>> {
    const documents = await this.database.query({
      collection: EnvConfig.mongodb.collections.dexLiquidityTokenSnapshots.name,
      query: {
        chain: chain,
        address: address,
      },
    });

    return documents.map((item) => DexscanDataTransformer.transformDexLiquidityTokenSnapshot(item));
  }

  public async getLiquidityPoolSnapshots(
    chain: string,
    tokenAddress: string,
  ): Promise<Array<AggDexLiquidityPoolSnapshot>> {
    const documents = await this.database.query({
      collection: EnvConfig.mongodb.collections.dexLiquidityPoolSnapshots.name,
      query: {
        chain: chain,
        'tokens.address': tokenAddress,
      },
    });

    return documents.map((item) => DexscanDataTransformer.transformDexLiquidityPoolSnapshot(item));
  }

  public async runUpdate(): Promise<void> {}
}
