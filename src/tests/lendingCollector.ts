import { expect } from 'chai';
import { describe } from 'mocha';

import { ProtocolConfigs } from '../configs';
import getProtocolAdapters from '../modules/adapters';
import BlockchainService from '../services/blockchains/blockchain';
import { IBlockchainService } from '../services/blockchains/domains';
import DatabaseService from '../services/database/database';
import { IDatabaseService } from '../services/database/domains';

const database: IDatabaseService = new DatabaseService();
const blockchain: IBlockchainService = new BlockchainService();

const adapters = getProtocolAdapters({
  database: database,
  blockchain: blockchain,
});

describe('collector lending', async function () {
  Object.values(ProtocolConfigs).map((protocolConfig) =>
    protocolConfig.lendingMarkets
      ? describe(protocolConfig.protocol, async function () {
          if (protocolConfig.lendingMarkets) {
            protocolConfig.lendingMarkets.map((item) =>
              it(`can get lending market ${protocolConfig.protocol}:${item.chain}:${item.address}`, async function () {
                const snapshots = await adapters[protocolConfig.protocol].getLendingMarketSnapshots({
                  config: item,
                  timestamp: item.birthday,
                });

                expect(snapshots).not.equal(null);
              }),
            );
          }
        })
      : null,
  );
});
