// this task help to update historical Maker data into database
import MakerPotAbi from '../configs/abi/maker/Pot.json';
import { SolidityUnits, TimeUnits } from '../configs/constants';
import { AddressesBook } from '../configs/data';
import EnvConfig from '../configs/envConfig';
import { ProtocolNames } from '../configs/names';
import { formatBigNumberToString, getDateString, getTodayUTCTimestamp } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';
import DatabaseService from '../services/database/database';

let startTime = 1573689600; // Thu Nov 14 2019 00:00:00 GMT+0000

const chain = 'ethereum';
const pot = AddressesBook.ethereum.MakerPot;
const dai = '0x6b175474e89094c44da98b954eedeac495271d0f';

(async function () {
  const blockchain = new BlockchainService();
  const database = new DatabaseService();
  await database.connect(EnvConfig.mongodb.connectionUri, EnvConfig.mongodb.databaseName);

  const today = getTodayUTCTimestamp();
  while (startTime <= today) {
    const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp(chain, startTime);

    const dsr = await blockchain.readContract({
      chain: chain,
      abi: MakerPotAbi,
      target: pot,
      method: 'dsr',
      params: [],
      blockNumber: blockNumber,
    });

    const rate = formatBigNumberToString(dsr.toString(), SolidityUnits.RayDecimals);
    await database.update({
      collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
      keys: {
        chain: chain,
        protocol: ProtocolNames.maker,
        address: dai,
      },
      updates: {
        extended: {
          daiSavingRate: rate,
        },
      },
      upsert: false,
    });

    console.log(getDateString(startTime), rate);

    startTime += TimeUnits.SecondsPerDay;
  }

  process.exit(0);
})();
