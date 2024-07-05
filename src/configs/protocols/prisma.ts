import { CdpLendingMarketConfig, DataMetrics, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { TokensBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';

export interface PrismaLendingMarket extends CdpLendingMarketConfig {
  factory: string;
  prismaCore: string;
  borrowOperations: string;
}

export interface PrismaProtocolConfig extends ProtocolConfig {
  configs: Array<PrismaLendingMarket>;
}

export const PrismaConfigs: PrismaProtocolConfig = {
  protocol: ProtocolNames.prisma,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.prisma,
      version: LendingMarketVersions.cdp.prisma,
      birthday: 1708300800, // Mon Feb 19 2024 00:00:00 GMT+0000
      metric: DataMetrics.cdpLending,
      address: '0x35282d87011f87508d457f08252bc5bfa52e10a0', // ULTRA token address
      debtToken: TokensBook.ethereum['0x35282d87011f87508d457f08252bc5bfa52e10a0'],
      factory: '0xdb2222735e926f3a18d7d1d0cfeef095a66aea2a',
      prismaCore: '0x5d17ea085f2ff5da3e6979d5d26f1dbab664ccf8',
      borrowOperations: '0x72c590349535ad52e6953744cb2a36b409542719',
    },
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.prisma,
      version: LendingMarketVersions.cdp.prisma,
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      metric: DataMetrics.cdpLending,
      address: '0x4591dbff62656e7859afe5e45f6f47d3669fbb28', // mkUSD token address
      debtToken: TokensBook.ethereum['0x4591dbff62656e7859afe5e45f6f47d3669fbb28'],
      factory: '0x70b66e20766b775b2e9ce5b718bbd285af59b7e1',
      prismaCore: '0x5d17ea085f2ff5da3e6979d5d26f1dbab664ccf8',
      borrowOperations: '0x72c590349535ad52e6953744cb2a36b409542719',
    },
  ],
};
