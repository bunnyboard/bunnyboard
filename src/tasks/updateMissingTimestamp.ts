// help to query missing timestamp items and update it
import envConfig from '../configs/envConfig';
import EnvConfig from '../configs/envConfig';
import { tryQueryBlockTimestamps } from '../lib/subsgraph';
import DatabaseService from '../services/database/database';

(async function () {
  const database = new DatabaseService();
  await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

  const chain = 'ethereum';
  const collection = await database.getCollection(EnvConfig.mongodb.collections.lendingMarketActivities);

  let oldestBlockNumber = 0;
  let latestBlockNumber = 0;

  const oldestItems = await collection
    .find({
      timestamp: { $exists: false },
      chain: chain,
    })
    .limit(1)
    .sort({ blockNumber: 1 })
    .toArray();
  if (oldestItems.length > 0) {
    oldestBlockNumber = oldestItems[0].blockNumber;
  }
  const latestItems = await collection
    .find({
      timestamp: { $exists: false },
      chain: chain,
    })
    .limit(1)
    .sort({ blockNumber: -1 })
    .toArray();
  if (oldestItems.length > 0) {
    latestBlockNumber = latestItems[0].blockNumber;
  }

  if (oldestItems && latestItems) {
    const range = 2000;

    while (oldestBlockNumber < latestBlockNumber) {
      const blocktimes = await tryQueryBlockTimestamps(
        EnvConfig.blockchains[chain].blockSubgraph,
        oldestBlockNumber,
        oldestBlockNumber + range,
      );

      const operations: Array<any> = [];
      for (const [blockNumber, timestamp] of Object.entries(blocktimes)) {
        operations.push({
          updateMany: {
            filter: {
              chain: chain,
              blockNumber: Number(blockNumber),
            },
            update: {
              $set: {
                timestamp: Number(timestamp),
              }
            },
            upsert: false,
          },
        });
      }

      if (operations.length > 0) {
        await collection.bulkWrite(operations);
      }

      oldestBlockNumber += range;

      console.log(chain, oldestBlockNumber, operations.length);
    }
  }

  process.exit(0);
})();
