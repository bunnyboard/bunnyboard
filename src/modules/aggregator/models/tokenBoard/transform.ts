import { calPreviousOf_Current_And_Change, convertToNumber } from '../../../../lib/math';
import { AggTokenBoardErc20Snapshot } from '../../../../types/aggregates/tokenBoard';
import { TokenBoardErc20DataTimeframe } from '../../../../types/collectors/tokenBoard';
import { transformTokenValueToUsd } from '../../helper';

export default class TokenBoardDataTransformer {
  // TokenBoardErc20DataTimeframe -> AggTokenBoardErc20Snapshot
  public static transformTokenBoardErc20Snapshot(
    // from CurrentTime - DAY -> CurrentTime
    currentLast24Hours: TokenBoardErc20DataTimeframe,
    // from CurrentTime - 2 * DAY -> CurrentTime - DAY
    previousLast24Hours: TokenBoardErc20DataTimeframe | null,
  ): AggTokenBoardErc20Snapshot {
    const fullDilutedValuationCurrent =
      convertToNumber(currentLast24Hours.tokenPrice) * convertToNumber(currentLast24Hours.totalSupply);
    const fullDilutedValuationPrevious = previousLast24Hours
      ? convertToNumber(currentLast24Hours.tokenPrice) * convertToNumber(currentLast24Hours.totalSupply)
      : 0;

    const addressBalanceCurrent: any = {};
    const addressBalancePrevious: any = {};
    for (const balance of currentLast24Hours.addressBalances) {
      if (!addressBalanceCurrent[balance.holder]) {
        addressBalanceCurrent[balance.holder] = true;
      }
    }
    if (previousLast24Hours) {
      for (const balance of previousLast24Hours.addressBalances) {
        if (!addressBalancePrevious[balance.holder]) {
          addressBalancePrevious[balance.holder] = true;
        }
      }
    }

    return {
      protocol: currentLast24Hours.protocol,
      chain: currentLast24Hours.chain,
      address: currentLast24Hours.address,
      symbol: currentLast24Hours.symbol,
      decimals: currentLast24Hours.decimals,
      stablecoin: currentLast24Hours.stablecoin,
      metric: currentLast24Hours.metric,
      timestamp: currentLast24Hours.timestamp,
      timefrom: currentLast24Hours.timefrom,
      timeto: currentLast24Hours.timeto,

      tokenPrice: {
        value: convertToNumber(currentLast24Hours.tokenPrice),
        changedDay: previousLast24Hours
          ? calPreviousOf_Current_And_Change(currentLast24Hours.tokenPrice, previousLast24Hours.tokenPrice)
          : undefined,
      },
      totalSupply: {
        value: convertToNumber(currentLast24Hours.totalSupply),
        changedDay: previousLast24Hours
          ? calPreviousOf_Current_And_Change(currentLast24Hours.totalSupply, previousLast24Hours.totalSupply)
          : undefined,
      },
      fullDilutedValuation: {
        value: fullDilutedValuationCurrent,
        changedDay:
          fullDilutedValuationPrevious > 0
            ? calPreviousOf_Current_And_Change(fullDilutedValuationCurrent, fullDilutedValuationPrevious)
            : undefined,
      },

      volumeTransfer: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenPriceField: 'tokenPrice',
        tokenValueField: 'volumeTransfer',
      }),
      volumeMint: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenPriceField: 'tokenPrice',
        tokenValueField: 'volumeMint',
      }),
      volumeBurn: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenPriceField: 'tokenPrice',
        tokenValueField: 'volumeBurn',
      }),
      volumeOnDex: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenPriceField: 'tokenPrice',
        tokenValueField: 'volumeOnDex',
      }),
      numberOfActiveHolders: {
        value: Object.keys(addressBalanceCurrent).length,
        changedDay:
          Object.keys(addressBalancePrevious).length > 0
            ? calPreviousOf_Current_And_Change(
                Object.keys(addressBalanceCurrent).length,
                Object.keys(addressBalancePrevious).length,
              )
            : undefined,
      },
    };
  }
}
