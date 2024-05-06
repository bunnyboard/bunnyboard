// somehow collector missed to get token price on time
// this script helps to rescan database with token price === null or '0'
// get token price and update to database
import EnvConfig from '../configs/envConfig';
import logger from '../lib/logger';
import { getDateString } from '../lib/utils';
import DatabaseService from '../services/database/database';
import OracleService from '../services/oracle/oracle';

// scan these collections
const collectionNames = [EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name];

(async function () {
  const oracle = new OracleService();

  const database = new DatabaseService();
  await database.connect(EnvConfig.mongodb.connectionUri, EnvConfig.mongodb.databaseName);

  for (const collectionName of collectionNames) {
    let wrongDocument = null;
    do {
      wrongDocument = (
        await database.query({
          collection: collectionName,
          query: {
            tokenPrice: '0',
          },
          options: {
            limit: 1,
            skip: 0,
            order: { timestamp: -1 },
          },
        })
      )[0];

      if (wrongDocument) {
        const tokenPrice = await oracle.getTokenPriceUsd({
          chain: wrongDocument.token.chain,
          address: wrongDocument.token.address,
          timestamp: wrongDocument.timestamp,
        });
        if (tokenPrice) {
          await database.update({
            collection: collectionName,
            keys: {
              chain: wrongDocument.chain,
              'token.address': wrongDocument.token.address,
              timestamp: wrongDocument.timestamp,
            },
            updates: {
              tokenPrice: tokenPrice,
            },
            upsert: false,
          });

          logger.info('updated token price', {
            service: 'task',
            chain: wrongDocument.token.chain,
            symbol: wrongDocument.token.symbol,
            address: wrongDocument.token.address,
            time: getDateString(wrongDocument.timestamp),
            price: tokenPrice,
          });
        } else {
          logger.error('failed to get token price', {
            service: 'task',
            chain: wrongDocument.token.chain,
            symbol: wrongDocument.token.symbol,
            address: wrongDocument.token.address,
            time: getDateString(wrongDocument.timestamp),
          });
          process.exit(1);
        }
      }
    } while (wrongDocument);
  }

  process.exit(0);
})();
