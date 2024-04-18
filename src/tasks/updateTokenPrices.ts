// this task help to query and update token price from database documents
import EnvConfig from '../configs/envConfig';
import { getDateString } from '../lib/utils';
import DatabaseService from '../services/database/database';
import OracleService from '../services/oracle/oracle';

const chainName = 'ethereum';
const tokenAddress = '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee';

(async function () {
  const oracle = new OracleService();

  const database = new DatabaseService();
  await database.connect(EnvConfig.mongodb.connectionUri, EnvConfig.mongodb.databaseName);

  const collectionNames = [EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name];

  for (const collectionName of collectionNames) {
    const snapshots = await database.query({
      collection: collectionName,
      query: {
        chain: chainName,
        'token.address': '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
      },
    });

    for (const snapshot of snapshots) {
      if (snapshot.tokenPrice === '0') {
        const timestamp = Number(snapshot.timestamp);

        const tokenPrice = await oracle.getTokenPriceUsd({
          address: tokenAddress,
          chain: chainName,
          timestamp: timestamp,
        });

        await database.update({
          collection: collectionName,
          keys: {
            chain: chainName,
            'token.address': tokenAddress,
            timestamp: snapshot.timestamp,
          },
          updates: {
            tokenPrice: tokenPrice,
          },
          upsert: false,
        });

        console.log(getDateString(snapshot.timestamp), tokenPrice);
      }
    }
  }

  process.exit(0);
})();
