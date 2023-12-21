// help to query missing token price and update it
import envConfig from '../configs/envConfig';
import EnvConfig from '../configs/envConfig';
import DatabaseService from '../services/database/database';
import OracleService from '../services/oracle/oracle';

(async function () {
  const database = new DatabaseService();
  await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

  const oracle = new OracleService();

  const collection = await database.getCollection(EnvConfig.mongodb.collections.lendingMarketSnapshots);
  const cursor = collection.find({
    tokenPrice: '0',
  });

  while (await cursor.hasNext()) {
    const document = await cursor.next();
    if (document) {
      const priceUsd = await oracle.getTokenPriceUsd({
        chain: document.chain,
        address: document.token.address,
        timestamp: document.timestamp,
      });

      if (!priceUsd) {
        console.log(`failed to get token price ${document.chain} ${document.token.address} ${document.timestamp}`);
      } else {
        if (priceUsd !== '0') {
          await database.update({
            collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
            keys: {
              chain: document.chain,
              address: document.address,
              'token.address': document.token.address,
              timestamp: document.timestamp,
            },
            updates: {
              tokenPrice: priceUsd,
            },
            upsert: false,
          });
          console.log(`updated token price ${document.chain} ${document.token.address} ${document.timestamp}`);
        } else {
          console.log(`get token price 0 ${document.chain} ${document.token.address} ${document.timestamp}`);
        }
      }
    }
  }

  process.exit(0);
})();
