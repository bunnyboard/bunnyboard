import axios from 'axios';

import { OracleSourceOffchain } from '../../types/oracles';

// https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#klinecandlestick-data
export async function getTokenPriceFromBinance(source: OracleSourceOffchain, timestamp: number): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/klines?symbol=${source.ticker}&interval=1d&startTime=${
        timestamp * 1000
      }&endTime=${timestamp * 1000}`,
    );
    if (response.data) {
      if (response.data.length > 0) {
        const dayData = response.data[0];
        if (dayData.length > 0) {
          return dayData[1].toString();
        }
      }
    }
  } catch (e: any) {}

  return '0';
}
