// this task help to query and update token price from database documents
import EnvConfig from '../configs/envConfig';
import logger from '../lib/logger';
import DatabaseService from '../services/database/database';
import OracleService from '../services/oracle/oracle';

(async function () {
  const oracle = new OracleService();

  const database = new DatabaseService();
  await database.connect(EnvConfig.mongodb.connectionUri, EnvConfig.mongodb.databaseName);

  const collections: Array<string> = [
    EnvConfig.mongodb.collections.crossLendingReserveStates.name,
    EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
    EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
    EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
  ];

  for (const collection of collections) {
    const documents = await database.query({
      collection: collection,
      query: {
        tokenPrice: '0',
      },
    });

    for (const document of documents) {
      const tokenPrice = await oracle.getTokenPriceUsd({
        chain: document.chain,
        address: document.token.address,
        timestamp: document.timestamp,
      });
      if (tokenPrice && tokenPrice !== '0') {
        logger.info('updating token price', {
          collection: collection,
          chain: document.chain,
          token: document.token.address,
          tokenPrice: tokenPrice,
          time: document.timestamp,
        });

        await database.update({
          collection: collection,
          keys: {
            'token.chain': document.token.chain,
            'token.address': document.token.address,
            timestamp: document.timestamp,
          },
          updates: {
            tokenPrice: tokenPrice,
          },
          upsert: false,
        });
      } else {
        logger.warn('failed to update token price', {
          collection: collection,
          chain: document.chain,
          token: document.token.address,
          time: document.timestamp,
        });
      }
    }
  }
})();
