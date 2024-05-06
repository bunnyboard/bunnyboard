// update missing factor on compound.finance reserve
import CompoundComptrollerAbi from '../configs/abi/compound/Comptroller.json';
import CompoundComptrollerV1Abi from '../configs/abi/compound/ComptrollerV1.json';
import cERC20Abi from '../configs/abi/compound/cErc20.json';
import IronbankComptrollerOldAbi from '../configs/abi/ironbank/FirstComptroller.json';
import EnvConfig from '../configs/envConfig';
import { CompoundConfigs, CompoundLendingMarketConfig } from '../configs/protocols/compound';
import logger from '../lib/logger';
import { formatBigNumberToString, getDateString, normalizeAddress } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';
import DatabaseService from '../services/database/database';

const database = new DatabaseService();
const blockchain = new BlockchainService();

const fromDate = 1557273600;

async function getAllMarkets(config: CompoundLendingMarketConfig, blockNumber: number): Promise<Array<string> | null> {
  const abis: Array<any> = [CompoundComptrollerAbi, CompoundComptrollerV1Abi, IronbankComptrollerOldAbi];

  for (const abi of abis) {
    const allMarkets = await blockchain.readContract({
      chain: config.chain,
      abi: abi,
      target: config.address,
      method: 'getAllMarkets',
      params: [],
      blockNumber,
    });
    if (allMarkets) {
      return allMarkets as Array<string>;
    }
  }

  return config.preDefinedMarkets ? config.preDefinedMarkets : null;
}

async function getMarketReserveFactorRate(
  config: CompoundLendingMarketConfig,
  cTokenContract: string,
  blockNumber: number,
): Promise<any> {
  const reserveFactorMantissa = await blockchain.readContract({
    chain: config.chain,
    abi: cERC20Abi,
    target: cTokenContract,
    method: 'reserveFactorMantissa',
    params: [],
    blockNumber,
  });
  if (reserveFactorMantissa) {
    return formatBigNumberToString(reserveFactorMantissa.toString(), 18);
  }

  return '0';
}

(async function () {
  const marketConfig = CompoundConfigs.configs[0] as CompoundLendingMarketConfig;

  await database.connect(EnvConfig.mongodb.connectionUri, EnvConfig.mongodb.databaseName);

  let runDate = 1636934400;
  while (runDate >= fromDate) {
    const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp('ethereum', runDate);
    const cTokens = await getAllMarkets(marketConfig, blockNumber);

    if (cTokens) {
      for (const cToken of cTokens) {
        const reserveFactor = await getMarketReserveFactorRate(marketConfig, cToken, blockNumber);
        await database.update({
          collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
          keys: {
            chain: 'ethereum',
            protocol: 'compound',
            address: normalizeAddress(cToken),
            timestamp: runDate,
          },
          updates: {
            rateReserveFactor: reserveFactor,
          },
          upsert: false,
        });

        logger.info('updated cToken reserve factor', {
          service: 'task',
          cToken: cToken,
          reserveFactor: reserveFactor,
          date: getDateString(runDate),
        });
      }
    }

    runDate -= 24 * 60 * 60;
  }
})();
