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
  dataAggregates: {
    name: `${MongodbPrefix}.dataAggregates`,
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
        timestamp: 12,
      },
    ],
  },
  cdpLendingMarketStates: {
    name: `${MongodbPrefix}.cdpLendingMarketStates`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        'token.address': 1,
      },
    ],
  },
  cdpLendingMarketSnapshots: {
    name: `${MongodbPrefix}.cdpLendingMarketSnapshots`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        'token.address': 1,
        timestamp: 1,
      },
    ],
  },
  perpetualReserveStates: {
    name: `${MongodbPrefix}.perpetualReserveStates`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1,
        'token.address': 1,
      },
    ],
  },
  perpetualReserveSnapshots: {
    name: `${MongodbPrefix}.perpetualReserveSnapshots`,
    indies: [
      {
        chain: 1,
        protocol: 1,
        address: 1,
        'token.address': 1,
        timestamp: 1,
      },
    ],
  },
};
