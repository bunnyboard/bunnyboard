import { DataMetrics } from '../../types/configs';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const IronbankConfigs: CompoundProtocolConfig = {
  protocol: 'ironbank',
  configs: formatCompoundLendingMarketConfig([
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      metric: DataMetrics.lending,
      birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
      address: '0xAB1c342C7bf5Ec5F02ADEA1c2270670bCa144CbB',
      governanceToken: null,
      underlying: {}, // no native markets
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      metric: DataMetrics.lending,
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0x4250A6D3BD57455d7C6821eECb6206F507576cD2',
      governanceToken: null,
      underlying: {}, // no native markets
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      metric: DataMetrics.lending,
      birthday: 1633737600, // Sat Oct 09 2021 00:00:00 GMT+0000
      address: '0x2eE80614Ccbc5e28654324a66A396458Fa5cD7Cc',
      governanceToken: null,
      underlying: {}, // no native markets
    },
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      metric: DataMetrics.lending,
      birthday: 1655942400, // Thu Jun 23 2022 00:00:00 GMT+0000
      address: '0xE0B57FEEd45e7D908f2d0DaCd26F113Cf26715BF',
      governanceToken: null,
      underlying: {}, // no native markets
    },
  ]),
};
