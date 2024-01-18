import { DataMetrics } from '../../types/configs';
import { AaveProtocolConfig, formatAaveLendingMarketConfig } from './aave';

export const SparkConfigs: AaveProtocolConfig = {
  protocol: 'spark',
  configs: formatAaveLendingMarketConfig([
    {
      chain: 'ethereum',
      protocol: 'spark',
      type: 'cross',
      version: 'aavev3',
      birthday: 1678233600, // Wed Mar 08 2023 00:00:00 GMT+0000
      metric: DataMetrics.lending,
      address: '0xC13e21B648A5Ee794902342038FF3aDAB66BE987',
      priceOracle: '0x8105f69D9C41644c6A0803fDA7D03Aa70996cFD9',
      dataProvider: '0xFc21d6d146E6086B8359705C8b28512a983db0cb',
      incentiveController: '0x4370D3b6C9588E02ce9D22e684387859c7Ff5b34',
    },
    {
      chain: 'gnosis',
      protocol: 'spark',
      type: 'cross',
      version: 'aavev3',
      birthday: 1693958400, // Wed Sep 06 2023 00:00:00 GMT+0000
      metric: DataMetrics.lending,
      address: '0x2Dae5307c5E3FD1CF5A72Cb6F698f915860607e0',
      priceOracle: '0x8105f69D9C41644c6A0803fDA7D03Aa70996cFD9',
      dataProvider: '0x2a002054A06546bB5a264D57A81347e23Af91D18',
      incentiveController: '0x98e6BcBA7d5daFbfa4a92dAF08d3d7512820c30C',
    },
  ]),
};
