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

const ignoredTokens = [
  '0x81d66d255d47662b6b16f3c5bbfbb15283b05bc2', // ibZAR
  '0x39aa39c021dfbae8fac545936693ac917d5e7563', // cUSDC
  '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9', // cUSDT
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', // cDAI
  '0x5bc25f649fc4e26069ddf4cf4010f9f706c23831', // DUSD
  '0xb01e8419d842beebf1b70a7b5f7142abbaf7159d', // COVER
  '0x44b26e839eb3572c5e959f994804a5de66600349', // HEGIC
  '0x1456688345527be1f37e9e627da0837d6f08c925', // unit USDP
  '0x924828a9fb17d47d0eb64b57271d10706699ff11', // SFI fantom
  '0x0e1694483ebb3b74d3054e383840c6cf011e518e', // sUSD fantom
  '0x2a5062d22adcfaafbd5c541d4da82e4b450d4212', // KP3R fantom
  '0x1337def18c680af1f9f45cbcab6309562975b1dd', // arNXM
  '0x1337def16f9b486faed0293eb623dc8395dfe46a', // ARMOR
];

(async function () {
  const oracle = new OracleService(null);

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
            'token.address': {
              $nin: ignoredTokens,
            },
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
