import dotenv from 'dotenv';

import { EnvConfig } from '../types/configs';
import { BlockchainConfigs } from './blockchains';

// global env and configurations
dotenv.config();

const MongodbPrefix = 'board';

const envConfig: EnvConfig = {
  mongodb: {
    databaseName: String(process.env.BUNNYBOARD_MONGODB_NAME),
    connectionUri: String(process.env.BUNNYBOARD_MONGODB_URI),
    collections: {
      states: `${MongodbPrefix}.states`,
      caching: `${MongodbPrefix}.caching`,
      tokenPrices: `${MongodbPrefix}.tokenPrices`,
      chainMetricSnapshots: `${MongodbPrefix}.chainMetricSnapshots`,
      lendingMarketSnapshots: `${MongodbPrefix}.lendingMarketSnapshots`,
      lendingMarketActivities: `${MongodbPrefix}.lendingMarketActivities`,
      masterchefPoolSnapshots: `${MongodbPrefix}.masterchefPoolSnapshots`,
      masterchefPoolActivities: `${MongodbPrefix}.masterchefPoolActivities`,
    },
  },
  blockchains: BlockchainConfigs,
};

export default envConfig;
