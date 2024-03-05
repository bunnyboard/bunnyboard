import { calChangesOf_Current_From_Previous, calValueOf_Amount_With_Price } from '../../lib/math';
import { DataValue } from '../../types/aggregates/common';

export interface TransformTokenValueToUsdOptions {
  currentValue: any;
  previousValue: any;

  // which field will be used as value in currentValue and previousValue objects
  tokenValueField: string;

  // which field will be used as token price
  tokenPriceField: string;
}

export function transformTokenValueToUsd(options: TransformTokenValueToUsdOptions): DataValue {
  const currentValueUsd = calValueOf_Amount_With_Price(
    (options.currentValue as any)[options.tokenValueField],
    (options.currentValue as any)[options.tokenPriceField],
  );
  const previousValueUsd = options.previousValue
    ? calValueOf_Amount_With_Price(
        (options.previousValue as any)[options.tokenValueField],
        (options.previousValue as any)[options.tokenPriceField],
      )
    : 0;

  return {
    value: currentValueUsd,
    changedDay: previousValueUsd ? calChangesOf_Current_From_Previous(currentValueUsd, previousValueUsd) : undefined,
  };
}
