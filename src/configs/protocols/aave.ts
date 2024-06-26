import {
  CrossLendingMarketConfig,
  DataMetrics,
  FlashloanConfig,
  FlashloanVersion,
  LendingMarketVersions,
  ProtocolConfig,
  StakingConfig,
  StakingVersions,
  Token,
} from '../../types/configs';
import { AddressesBook, TokensBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';

export interface AaveOracleConfig {
  address: string; // oracle contract address

  // The Aave V2 Ethereum market uses ETH based oracles which return values in wei units.
  // All other V2 markets use USD based oracles which return values with 8 decimals.
  // https://docs.aave.com/developers/v/2.0/the-core-protocol/price-oracle

  // Returns the price of the supported asset in BASE_CURRENCY of the Aave Market.
  // All V3 markets use USD based oracles which return values with 8 decimals.
  // https://docs.aave.com/developers/core-contracts/aaveoracle
  currency: 'eth' | 'usd';
}

export interface AaveLendingMarketConfig extends CrossLendingMarketConfig {
  dataProvider: string;
  oracle?: AaveOracleConfig;
}

export interface AaveProtocolConfig extends ProtocolConfig {
  configs: Array<AaveLendingMarketConfig | FlashloanConfig>;
}

export const Aavev2Configs: AaveProtocolConfig = {
  protocol: ProtocolNames.aavev2,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aavev2,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.ethereum.Aavev2LendingPool,
      dataProvider: AddressesBook.ethereum.Aavev2DataProvider,
      oracle: {
        currency: 'eth',
        address: AddressesBook.ethereum.Aavev2Oracle,
      },
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.aavev2,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1617235200, // Thu Apr 01 2021 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.polygon.Aavev2LendingPool,
      dataProvider: AddressesBook.polygon.Aavev2DataProvider,
      oracle: {
        currency: 'eth',
        address: AddressesBook.polygon.Aavev2Oracle,
      },
    },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.aavev2,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1632182400, // Tue Sep 21 2021 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.avalanche.Aavev2LendingPool,
      dataProvider: AddressesBook.avalanche.Aavev2DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.avalanche.Aavev2Oracle,
      },
    },

    // flashloan
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aavev2,
      version: FlashloanVersion.aavev2,
      birthday: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: AddressesBook.ethereum.Aavev2LendingPool,
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.aavev2,
      version: FlashloanVersion.aavev2,
      birthday: 1617235200, // Thu Apr 01 2021 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: AddressesBook.polygon.Aavev2LendingPool,
    },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.aavev2,
      version: FlashloanVersion.aavev2,
      birthday: 1632182400, // Tue Sep 21 2021 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: AddressesBook.avalanche.Aavev2LendingPool,
    },
  ],
};

export const Aavev3Configs: AaveProtocolConfig = {
  protocol: ProtocolNames.aavev3,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1674864000, // Sat Jan 28 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.ethereum.Aavev3LendingPool,
      dataProvider: AddressesBook.ethereum.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.ethereum.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.optimism.Aavev3LendingPool,
      dataProvider: AddressesBook.optimism.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.optimism.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.arbitrum.Aavev3LendingPool,
      dataProvider: AddressesBook.arbitrum.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.arbitrum.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.polygon.Aavev3LendingPool,
      dataProvider: AddressesBook.polygon.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.polygon.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.avalanche.Aavev3LendingPool,
      dataProvider: AddressesBook.avalanche.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.avalanche.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.fantom,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1692748800, // Wed Aug 23 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.fantom.Aavev3LendingPool,
      dataProvider: AddressesBook.fantom.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.fantom.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.base.Aavev3LendingPool,
      dataProvider: AddressesBook.base.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.base.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.metis,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1682294400, // Mon Apr 24 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.metis.Aavev3LendingPool,
      dataProvider: AddressesBook.metis.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.metis.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.gnosis,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1696464000, // Thu Oct 05 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.gnosis.Aavev3LendingPool,
      dataProvider: AddressesBook.gnosis.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.gnosis.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1706054400, // Wed Jan 24 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.bnbchain.Aavev3LendingPool,
      dataProvider: AddressesBook.bnbchain.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.bnbchain.Aavev3Oracle,
      },
    },
    {
      chain: ChainNames.scroll,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1705795200, // Sun Jan 21 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.scroll.Aavev3LendingPool,
      dataProvider: AddressesBook.scroll.Aavev3DataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.scroll.Aavev3Oracle,
      },
    },
  ],
};

export interface AaveStakingConfig extends StakingConfig {
  poolId: string;
  stakingToken: Token;
  rewardToken: Token; // AAVE token
}

export interface AaveProtocolStakingConfig extends ProtocolConfig {
  configs: Array<AaveStakingConfig>;
}

export const AaveConfigs: AaveProtocolStakingConfig = {
  protocol: ProtocolNames.aave,
  configs: [
    // aave staking
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aave,
      metric: DataMetrics.staking,
      version: StakingVersions.aave,
      poolId: 'stkAAVE',
      birthday: 1601683200, // Sat Oct 03 2020 00:00:00 GMT+0000
      address: AddressesBook.ethereum.AavevStakingAAVE,
      stakingToken: TokensBook.ethereum['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'],
      rewardToken: TokensBook.ethereum['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'],
    },

    // AAVE-ETH Balancer LP staking v1
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aave,
      metric: DataMetrics.staking,
      version: StakingVersions.aave,
      poolId: 'stkABPT',
      birthday: 1612137600, // Mon Feb 01 2021 00:00:00 GMT+0000
      address: AddressesBook.ethereum.AavevStakingAAVE_BPT,
      stakingToken: {
        chain: ChainNames.ethereum,
        symbol: 'ABPT',
        decimals: 18,
        address: '0x41a08648c3766f9f9d85598ff102a08f4ef84f84',
      },
      rewardToken: TokensBook.ethereum['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'],
    },

    // AAVE-ETH Balancer LP staking v2
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aave,
      metric: DataMetrics.staking,
      version: StakingVersions.aave,
      poolId: 'stkABPTv2',
      birthday: 1705622400, // Fri Jan 19 2024 00:00:00 GMT+0000
      address: AddressesBook.ethereum.AavevStakingAAVE_BPTv2,
      stakingToken: {
        chain: ChainNames.ethereum,
        symbol: 'ABPTv2',
        decimals: 18,
        address: '0x3de27efa2f1aa663ae5d458857e731c129069f29',
      },
      rewardToken: TokensBook.ethereum['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'],
    },

    // GHO staking
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aave,
      metric: DataMetrics.staking,
      version: StakingVersions.aave,
      poolId: 'stkGHO',
      birthday: 1705536000, // Thu Jan 18 2024 00:00:00 GMT+0000
      address: AddressesBook.ethereum.AavevStakingGHO,
      stakingToken: TokensBook.ethereum['0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f'], // GHO
      rewardToken: TokensBook.ethereum['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'], // AAVE
    },
  ],
};
