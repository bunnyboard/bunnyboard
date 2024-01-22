import BigNumber from 'bignumber.js';

import { DataValueItem } from '../../../types/aggregates/common';

export default class HelperTransform {
  // this helper function help to group, count and build up a DayData list
  // for example, given a list of data snapshot, there are multiple snapshots
  // at a given timestamp (day timestamp).
  // it helps to sum up these snapshots with a given field names
  public static buildupDayDataValueItems(dataList: Array<any>, fields: Array<string>): Array<any> {
    const items: Array<any> = [];

    const groupPerTimestamp: {
      [key: number]: {
        [key: string]: DataValueItem;
      };
    } = {};
    for (const data of dataList) {
      const timestamp = data.timestamp;
      if (!groupPerTimestamp[timestamp]) {
        groupPerTimestamp[timestamp] = {};
        for (const field of fields) {
          groupPerTimestamp[timestamp][field] = {
            value: 0,
            valueUsd: 0,
          };
        }
      }

      for (const field of fields) {
        groupPerTimestamp[timestamp][field].value = new BigNumber(groupPerTimestamp[timestamp][field].value)
          .plus(new BigNumber(data[field]))
          .toNumber();
        groupPerTimestamp[timestamp][field].valueUsd = data[`${field}Usd`]
          ? new BigNumber(groupPerTimestamp[timestamp][field].value).plus(new BigNumber(data[`${field}Usd`])).toNumber()
          : 0;
      }
    }

    for (const [timestamp, data] of Object.entries(groupPerTimestamp)) {
      items.push({
        timestamp: Number(timestamp),
        ...data,
      });
    }

    return items;
  }
}
