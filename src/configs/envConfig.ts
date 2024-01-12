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
      activities: `${MongodbPrefix}.activities`,
      lendingMarketStates: `${MongodbPrefix}.lendingMarketStates`,
      lendingMarketSnapshots: `${MongodbPrefix}.lendingMarketSnapshots`,
    },
  },
  blockchains: BlockchainConfigs,
};

export default envConfig;
