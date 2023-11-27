import axios from 'axios';

import logger from '../../../lib/logger';
import { getDateString, sleep } from '../../../lib/utils';

export default class CoingeckoLibs {
  public static async getTokenPriceUsd(coingeckoId: string, timestamp: number): Promise<string | null> {
    const dmy = new Date(timestamp * 1000).toISOString().split('T')[0].split('-');
    const day = Number(dmy[2]) > 9 ? Number(dmy[2]) : `0${Number(dmy[2])}`;
    const month = Number(dmy[1]) > 9 ? Number(dmy[1]) : `0${Number(dmy[1])}`;

    let price = null;
    do {
      try {
        await sleep(2); // avoid coingecko limit
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coingeckoId}/history?date=${day}-${month}-${dmy[0]}`,
        );

        if (response.data['market_data']) {
          price = response.data['market_data']['current_price']['usd'];
        }
      } catch (e: any) {
        if (e.response.status === 429) {
          await sleep(10);
          logger.debug('reached coingecko api limit and will try again', {
            service: 'lib.coingecko',
            id: coingeckoId,
            date: getDateString(timestamp),
          });
        } else {
          console.error(e.message);
          process.exit(0);
        }
      }
    } while (!price);

    return price;
  }
}
