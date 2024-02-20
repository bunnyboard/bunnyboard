import dotenv from 'dotenv';

import { EnvConfig } from '../types/configs';
import { BlockchainConfigs } from './blockchains';
import { DatabaseCollectionConfigs } from './database';

// global env and configurations
dotenv.config();

const envConfig: EnvConfig = {
  mongodb: {
    databaseName: String(process.env.BUNNYBOARD_MONGODB_NAME),
    connectionUri: String(process.env.BUNNYBOARD_MONGODB_URI),
    collections: DatabaseCollectionConfigs,
  },
  blockchains: BlockchainConfigs,
};

export default envConfig;
