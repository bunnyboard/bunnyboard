import { expect, test } from 'vitest';

import { ProtocolConfigs } from '../../../configs';
import { OracleConfigs } from '../../../configs/oracles/configs';
import { AaveLendingMarketConfig, Aavev2Configs, Aavev3Configs } from '../../../configs/protocols/aave';
import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import AaveLibs from '../../libs/aave';
import Aavev2Adapter from './aavev2';

const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

test('should have oracle configs for reserves correctly', async function () {
  for (const marketConfig of Aavev2Configs.configs.concat(Aavev3Configs.configs)) {
    const marketInfo = await AaveLibs.getMarketInfo(marketConfig as AaveLendingMarketConfig);
    expect(marketInfo).not.equal(null);
    if (marketInfo) {
      for (const token of marketInfo.reserves) {
        expect(OracleConfigs[token.chain][token.address]).not.equal(null);
        expect(OracleConfigs[token.chain][token.address]).not.equal(undefined);
      }
    }
  }
});

test('should get data correctly - aavev2 chain ethereum', async function () {
  const aavev2Adapter = new Aavev2Adapter({
    blockchain: blockchain,
    oracle: oracle,
  });

  const configEthereum = ProtocolConfigs.aavev2.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await aavev2Adapter.getDataState({
      config: configEthereum,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(undefined);

    if (dataState) {
      expect(dataState.length).equal(37);
    }
  }
});
