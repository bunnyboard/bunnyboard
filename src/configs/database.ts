import dotenv from 'dotenv';

import { DatabaseCollectionConfig } from '../types/configs';

dotenv.config();

const MongodbPrefix = 'board';
export const DatabaseCollectionConfigs: DatabaseCollectionConfig = {
  cachingStates: {
    name: `${MongodbPrefix}.cachingStates`,
    indies: [
      {
        name: 1,
      },
    ],
  },
  cachingData: {
    name: `${MongodbPrefix}.cachingData`,
    indies: [
      {
        name: 1,
      },
    ],
  },

  crossLendingReserveStates: {
    name: `${MongodbPrefix}.crossLendingReserveStates`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1,
        'token.address': 1,
      },
    ],
  },
  crossLendingReserveSnapshots: {
    name: `${MongodbPrefix}.crossLendingReserveSnapshots`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1,
        'token.address': 1,
        timestamp: 1,
      },
      {
        timestamp: 1,
      },
    ],
  },
  cdpLendingAssetStates: {
    name: `${MongodbPrefix}.cdpLendingAssetStates`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1, // debt token address
      },
    ],
  },
  cdpLendingAssetSnapshots: {
    name: `${MongodbPrefix}.cdpLendingAssetSnapshots`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1, // debt token address
        timestamp: 1,
      },
    ],
  },
  isolatedLendingAssetStates: {
    name: `${MongodbPrefix}.isolatedLendingAssetStates`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1, // market contract address
      },
    ],
  },
  isolatedLendingAssetSnapshots: {
    name: `${MongodbPrefix}.isolatedLendingAssetSnapshots`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1, // market contract address
        timestamp: 1,
      },
    ],
  },

  stakingPoolDataStates: {
    name: `${MongodbPrefix}.stakingPoolDataStates`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1,
        poolId: 1,
      },
    ],
  },
  stakingPoolDataSnapshots: {
    name: `${MongodbPrefix}.stakingPoolDataSnapshots`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1,
        poolId: 1,
        timestamp: 1,
      },
    ],
  },
};
