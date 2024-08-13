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
  env: {
    debug: String(process.env.BUNNYBOARD_ENV_DEBUG) === 'true',
  },
  externalConfigs: {
    etherscanApiKey: String(process.env.BUNNYBOARD_ETH_ETHERSCAN_API_KEY),
    beaconNode: String(process.env.BUNNYBOARD_ETH_BEACON_NODE),
    alchemyKey: String(process.env.BUNNYBOARD_ETH_ALCHEMY_KEY),
  },
};

export default envConfig;
