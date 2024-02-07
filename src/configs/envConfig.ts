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
      aggregates: `${MongodbPrefix}.aggregates`,
      lendingMarketStates: `${MongodbPrefix}.lendingMarketStates`,
      lendingMarketSnapshots: `${MongodbPrefix}.lendingMarketSnapshots`,
      perpetualMarketStates: `${MongodbPrefix}.perpetualMarketStates`,
      perpetualMarketSnapshots: `${MongodbPrefix}.perpetualMarketSnapshots`,
    },
  },
  blockchains: BlockchainConfigs,
};

export default envConfig;
