export interface AggLendingDataQueryFilters {
  chain: string | null | undefined;

  protocol: string | null | undefined;

  token: string | null | undefined; // token address

  action: string | null | undefined;

  timestamp: number | null | undefined;
}

export type AggDataQueryOrder = 'oldest' | 'latest';

export interface AggDataQueryPaging {
  page: number;
  order: AggDataQueryOrder;
}

export interface AggDataQueryOptions {
  type: string;
  metric: string;

  filters: AggLendingDataQueryFilters;

  paging: AggDataQueryPaging;
}

export interface AggDataQueryResult {
  totalPage: number;
  returnPage: number;
  returnOrder: AggDataQueryOrder;
  data: any;
}
