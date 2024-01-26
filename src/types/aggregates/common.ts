export const AggDataTypes = {
  snapshot: 'snapshot',
  activity: 'activity',
  aggregate: 'aggregate',
};

export const AggDataAggregateNames = {
  crossLendingDataState: 'crossLendingDataState',
  cdpLendingDataState: 'cdpLendingDataState',
};

export interface DataValueItem {
  // present value in base unit
  // ex: how many ETH tokens?
  value: number;

  // present value in usd
  // ex: how many US Dollars per ETH token?
  // ex: valueUsd = value * tokenPrice
  // null means it is not available
  valueUsd: number;

  // change fields present number of percentage were changed
  // from previous snapshot data

  // in base unit
  changedValue?: number;

  // in usd value
  changedValueUsd?: number;
}
