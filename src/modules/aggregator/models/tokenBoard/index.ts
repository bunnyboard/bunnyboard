import EnvConfig from '../../../../configs/envConfig';
import logger from '../../../../lib/logger';
import { AggTokenBoardErc20DataOverall, AggTokenBoardErc20DayData } from '../../../../types/aggregates/tokenBoard';
import { TokenBoardErc20DataStateWithTimeframes } from '../../../../types/collectors/tokenBoard';
import { Token } from '../../../../types/configs';
import BaseDataAggregator from '../../base';
import TokenBoardDataTransformer from './transform';

export default class TokenBoardDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.tokenBoard';

  private async getTokenBoardErc20DataOverallInternal(
    chain: string,
    address: string,
  ): Promise<AggTokenBoardErc20DataOverall | null> {
    // get all cross lending states
    const tokenDataState = await this.database.find({
      collection: EnvConfig.mongodb.collections.tokenBoardErc20States.name,
      query: {
        chain: chain,
        address: address,
      },
    });

    if (tokenDataState) {
      const stateWithTimeframes = tokenDataState as TokenBoardErc20DataStateWithTimeframes;
      const currentSnapshot = TokenBoardDataTransformer.transformTokenBoardErc20Snapshot(
        stateWithTimeframes,
        stateWithTimeframes.last24Hours,
      );

      // query history snapshots
      const dayData: Array<AggTokenBoardErc20DayData> = [];
      const snapshots = await this.database.query({
        collection: EnvConfig.mongodb.collections.tokenBoardErc20Snapshots.name,
        query: {
          chain: chain,
          address: address,
        },
      });
      for (const rawSnapshot of snapshots) {
        const snapshot = TokenBoardDataTransformer.transformTokenBoardErc20Snapshot(rawSnapshot, null);
        dayData.push({
          timestamp: snapshot.timestamp,
          tokenPrice: snapshot.tokenPrice.value,
          totalSupply: snapshot.totalSupply.value,
          fullDilutedValuation: snapshot.fullDilutedValuation.value,
          volumeTransfer: snapshot.volumeTransfer.value,
          volumeMint: snapshot.volumeMint.value,
          volumeBurn: snapshot.volumeBurn.value,
          volumeOnDex: snapshot.volumeOnDex.value,
          numberOfActiveHolders: snapshot.numberOfActiveHolders.value,
        });
      }

      return {
        ...currentSnapshot,
        dayData: dayData,
      };
    }

    return null;
  }

  // get current overall data of given token
  public async getTokenBoardErc20DataOverall(
    chain: string,
    address: string,
  ): Promise<AggTokenBoardErc20DataOverall | null> {
    const cachingKey = `tokenboard-erc20-overall-${chain}-${address}`;
    const overallData = await this.database.find({
      collection: EnvConfig.mongodb.collections.cachingData.name,
      query: {
        name: cachingKey,
      },
    });
    if (overallData) {
      return overallData.data as AggTokenBoardErc20DataOverall;
    } else {
      return await this.getTokenBoardErc20DataOverallInternal(chain, address);
    }
  }

  // get all tokens which available on token board
  public async getTokenBoardErc20List(): Promise<Array<Token>> {
    const collection = await this.database.getCollection(EnvConfig.mongodb.collections.tokenBoardErc20States.name);
    const tokens = await collection
      .aggregate([
        {
          $group: {
            _id: {
              chain: '$chain',
              address: '$address',
              symbol: '$symbol',
              decimals: '$decimals',
            },
          },
        },
      ])
      .toArray();

    return tokens.map((item) => {
      return {
        chain: item._id.chain,
        address: item._id.address,
        symbol: item._id.symbol,
        decimals: item._id.decimals,
      };
    });
  }

  public async runUpdate(): Promise<void> {
    const tokens = await this.getTokenBoardErc20List();
    for (const token of tokens) {
      const cachingKey = `tokenboard-erc20-overall-${token.chain}-${token.address}`;
      const tokenDataOverall = await this.getTokenBoardErc20DataOverallInternal(token.chain, token.address);

      await this.database.update({
        collection: EnvConfig.mongodb.collections.cachingData.name,
        keys: {
          name: cachingKey,
        },
        updates: {
          name: cachingKey,
          data: tokenDataOverall,
        },
        upsert: true,
      });

      logger.info('updated caching data', {
        service: this.name,
        name: cachingKey,
      });
    }
  }
}
