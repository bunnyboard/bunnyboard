import { calChangesOf_Current_From_Previous, calValueOf_Amount_With_Price, convertToNumber } from '../../lib/math';
import { DataValueItem } from '../../types/aggregates/common';

export function transformValueWithTokenPrice(
  dataTimeframeLast24Hours: any,
  dataTimeframeLast48Hours: any | null,
  field: string,
): DataValueItem {
  return {
    value: convertToNumber((dataTimeframeLast24Hours as any)[field]),
    valueUsd: calValueOf_Amount_With_Price(
      (dataTimeframeLast24Hours as any)[field],
      dataTimeframeLast24Hours.tokenPrice,
    ),
    changedValue:
      dataTimeframeLast48Hours && convertToNumber((dataTimeframeLast48Hours as any)[field]) !== 0
        ? calChangesOf_Current_From_Previous(
            (dataTimeframeLast24Hours as any)[field],
            (dataTimeframeLast48Hours as any)[field],
          )
        : undefined,
    changedValueUsd:
      dataTimeframeLast48Hours && convertToNumber((dataTimeframeLast48Hours as any)[field]) !== 0
        ? calChangesOf_Current_From_Previous(
            calValueOf_Amount_With_Price((dataTimeframeLast24Hours as any)[field], dataTimeframeLast24Hours.tokenPrice),
            calValueOf_Amount_With_Price((dataTimeframeLast48Hours as any)[field], dataTimeframeLast48Hours.tokenPrice),
          )
        : undefined,
  };
}
