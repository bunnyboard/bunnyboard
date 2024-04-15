// this task help to query and update token price from database documents
import BigNumber from 'bignumber.js';

import EnvConfig from '../configs/envConfig';
import DatabaseService from '../services/database/database';
import OracleService from '../services/oracle/oracle';

const tokenAddresses = [
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // ethereum
  '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', // arbitrum
  '0x68f180fcce6836688e9084f035309e29bf0a2095', // optimism
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', // polygon
  '0x50b7545627a5162f82a992c33b87adc75187b218', // avalanche
  '0x321162cd933e2be498cd2267a90534a804051b11', // fantom
];

(async function () {
  const oracle = new OracleService();

  const database = new DatabaseService();
  await database.connect(EnvConfig.mongodb.connectionUri, EnvConfig.mongodb.databaseName);

  const collectionNames = [
    EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
    EnvConfig.mongodb.collections.isolatedLendingAssetSnapshots.name,
  ];

  for (const collectionName of collectionNames) {
    const snapshots = await database.query({
      collection: collectionName,
      query: {},
    });

    for (const snapshot of snapshots) {
      const timestamp = Number(snapshot.timestamp);
      const chain = snapshot.chain;
      const address = snapshot.address;

      const collaterals = snapshot.collaterals as Array<any>;
      for (let i = 0; i < collaterals.length; i++) {
        const collateral = collaterals[i];

        if (tokenAddresses.indexOf(collateral.token.address) !== -1) {
          const tokenPriceCurrent = new BigNumber(collateral.tokenPrice);
          if (tokenPriceCurrent.gt(0) && tokenPriceCurrent.lte(100)) {
            const tokenPrice = await oracle.getTokenPriceUsd({
              address: tokenAddresses[0],
              chain: 'ethereum',
              timestamp: timestamp,
            });
            if (tokenPrice) {
              collaterals[i].tokenPrice = tokenPrice;

              await database.update({
                collection: collectionName,
                keys: {
                  chain: chain,
                  address: address,
                  timestamp: timestamp,
                },
                updates: {
                  collaterals: collaterals,
                },
                upsert: false,
              });

              console.log('OK', timestamp, chain, address, tokenPriceCurrent.toString(10), tokenPrice);
            } else {
              console.log('FAILED', timestamp, chain, address, tokenPriceCurrent.toString(10), tokenPrice);
            }
          } else {
            console.log('IGNORED');
          }
        }
      }
    }
  }

  process.exit(0);
})();
