import { DataMetrics } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const VenusConfigs: CompoundProtocolConfig = {
  protocol: 'venus',
  configs: formatCompoundLendingMarketConfig([
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      metric: DataMetrics.crossLending,
      birthday: 1614211200, // Fri Jan 01 2021 00:00:00 GMT+0000
      address: '0xfD36E2c2a6789Db23113685031d7F16329158384',
      governanceToken: {
        chain: 'bnbchain',
        symbol: 'XVS',
        decimals: 18,
        address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
      },
      underlying: cTokenMappings,
      blacklists: {
        '0xebd0070237a0713e8d94fef1b728d3d993d290ef': true, // vCAN
        '0x20bff4bbeda07536ff00e073bd8359e5d80d733d': true, // CAN
      },
    },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   metric: DataMetrics.crossLending,
    //   birthday: 1706054400, // Wed Jan 24 2024 00:00:00 GMT+0000
    //   address: '0x94c1495cd4c557f1560cbd68eab0d197e6291571',
    //   governanceToken: {
    //     chain: 'bnbchain',
    //     symbol: 'XVS',
    //     decimals: 18,
    //     address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    //   },
    //   underlying: cTokenMappings,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   metric: DataMetrics.crossLending,
    //   birthday: 1706572800, // Tue Jan 30 2024 00:00:00 GMT+0000
    //   address: '0x3344417c9360b963ca93a4e8305361aede340ab9',
    //   governanceToken: {
    //     chain: 'bnbchain',
    //     symbol: 'XVS',
    //     decimals: 18,
    //     address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    //   },
    //   underlying: cTokenMappings,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   metric: DataMetrics.crossLending,
    //   birthday: 1706572800, // Tue Jan 30 2024 00:00:00 GMT+0000
    //   address: '0x1b43ea8622e76627b81665b1ecebb4867566b963',
    //   governanceToken: {
    //     chain: 'bnbchain',
    //     symbol: 'XVS',
    //     decimals: 18,
    //     address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    //   },
    //   underlying: cTokenMappings,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   metric: DataMetrics.crossLending,
    //   birthday: 1706572800, // Tue Jan 30 2024 00:00:00 GMT+0000
    //   address: '0xd933909a4a2b7a4638903028f44d1d38ce27c352',
    //   governanceToken: {
    //     chain: 'bnbchain',
    //     symbol: 'XVS',
    //     decimals: 18,
    //     address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    //   },
    //   underlying: cTokenMappings,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   metric: DataMetrics.crossLending,
    //   birthday: 1706572800, // Tue Jan 30 2024 00:00:00 GMT+0000
    //   address: '0x23b4404e4e5ec5ff5a6ffb70b7d14e3fabf237b0',
    //   governanceToken: {
    //     chain: 'bnbchain',
    //     symbol: 'XVS',
    //     decimals: 18,
    //     address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    //   },
    //   underlying: cTokenMappings,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   metric: DataMetrics.crossLending,
    //   birthday: 1715817600, // Thu May 16 2024 00:00:00 GMT+0000
    //   address: '0x33b6fa34cd23e5aeed1b112d5988b026b8a5567d',
    //   governanceToken: {
    //     chain: 'bnbchain',
    //     symbol: 'XVS',
    //     decimals: 18,
    //     address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    //   },
    //   underlying: cTokenMappings,
    // },

    // ethereum
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.venus,
      version: 'compound',
      metric: DataMetrics.crossLending,
      birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
      address: '0x687a01ecf6d3907658f7a7c714749fac32336d1b',
      governanceToken: null,
      underlying: cTokenMappings,
    },
    // {
    //   chain: ChainNames.ethereum,
    //   protocol: ProtocolNames.venus,
    //   version: 'compound',
    //   metric: DataMetrics.crossLending,
    //   birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
    //   address: '0x67aa3ecc5831a65a5ba7be76bed3b5dc7db60796',
    //   governanceToken: null,
    //   underlying: cTokenMappings,
    // },
    // {
    //   chain: ChainNames.ethereum,
    //   protocol: ProtocolNames.venus,
    //   version: 'compound',
    //   metric: DataMetrics.crossLending,
    //   birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
    //   address: '0xf522cd0360ef8c2ff48b648d53ea1717ec0f3ac3',
    //   governanceToken: null,
    //   underlying: cTokenMappings,
    // },
  ]),
};
