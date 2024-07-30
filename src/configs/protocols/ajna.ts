import { DataMetrics, IsolatedLendingMarketConfig, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface AjnaLendingConfig extends IsolatedLendingMarketConfig {
  whitelistedPools: Array<string>;
}

export interface AjnaProtocolConfig extends ProtocolConfig {
  configs: Array<AjnaLendingConfig>;
}

export const AjnaConfigs: AjnaProtocolConfig = {
  protocol: ProtocolNames.ajna,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.ajna,
      metric: DataMetrics.isolatedLending,
      version: LendingMarketVersions.isolated.ajna,
      birthday: 1704499200, // Sat Jan 06 2024 00:00:00 GMT+0000
      address: '0x6146dd43c5622bb6d12a5240ab9cf4de14edc625', // Pool Factory
      whitelistedPools: [
        '0x3ba6a019ed5541b5f5555d8593080042cf3ae5f4', // wstETH / WETH
        '0x66ea46c6e7f9e5bb065bd3b1090fff229393ba51', // YFI / DAI
        '0xc2a03288c046c7447faa598a515e494cbc7187c3', // RBN / WETH
        '0x50f1c63f3aefd60c665ef45aa74f274dabf93405', // WBTC / DAI
        '0x64aa997236996823a53b8b30ead599aa2f0382fa', // yvCurve-USDM-sDAI-f / DAI
        '0x304375e4890146dc575b894b35a42608fab823a8', // st-yETH / DAI
        '0x3bb7c1e268a51b2d933c0490e282e20b906f8652', // WBTC / USDC
        '0x1b3ca2a7b12859fe34cefd7072d770fb6a1e7679', // mwstETH-WPUNKS:20 / wstETH
        '0xcff6231d6dcd52d98f1ec1afec7063962fc3092f', // dETH / WETH
        '0x7a2f9d2610ab99952dfb44f8aa3707584baacb8d', // mwstETH-WPUNKS:40 / wstETH
        '0x1eea11c09eb446261739bbd1315992c3632960df', // apxETH / WETH
        '0xe300b3a6b24cb3c5c87034155f7fff7f77c862a0', // rETH / WETH
        '0x34bc3d3d274a355f3404c5dee2a96335540234de', // sUSDe / DAI
        '0xe4bfb9b344a0ae89702184281f13a295f3d49e15', // WETH / USDC
        '0xe9be38166cf94d730bb779ed3323722676b10851', // PRIME / USDC
        '0x0598c1feda47535ff5248e2bd08703ace4e740c4', // MKR / DAI
        '0x9cdb48fcbd8241bb75887af04d3b1302c410f671', // rETH / DAI
        '0xee9ad5700e17a95a397827c297958472c6669882', // COW / DAI
        '0xcd261cd365389a58e6467bb8a83a9e437864e8e5', // wstETH / DAI
        '0xf5b1ad7f82549c2bbf08aaa79c9efc70c6e46b06', // wstETH / USDC
        '0x90ac6604ae71b5d978f3fc6074078987249119ea', // sDAI / USDC
        '0x652765516e2547c0ec301bee0179c9dec6e54e6d', // asdCRV / CRV
        '0x2feef99a711d684e00a017c4ac587bea31f12875', // AJNA / DAI
        '0x2ceb74bb7a92d652c850c16f48547aa49f8bca31', // USDC / WETH
        '0xe3fbb8ca68401e08556746e5656937f4f2a89e7d', // csETH / WETH
        '0xe92cd0acf334d1133551bc4c87ea73bbc49ce711', // USDC / WBTC
      ],
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.ajna,
      metric: DataMetrics.isolatedLending,
      version: LendingMarketVersions.isolated.ajna,
      birthday: 1705536000, // Thu Jan 18 2024 00:00:00 GMT+0000
      address: '0x214f62b5836d83f3d6c4f71f174209097b1a779c', // Pool Factory
      whitelistedPools: [
        '0x0b17159f2486f669a1f930926638008e2ccb4287',
        '0xcb1953ee28f89731c0ec088da0720fc282fcfa9c',
        '0x63a366fc5976ff72999c89f69366f388b7d233e8',
        '0x2b2b94dc8e974433c7c4ec7741f686eb46584831',
        '0x1dec31e6550c958af3e116f23472fe1493476496',
        '0x92c85b18e7f0df000bbfab4ce76c28a4ddbae64a',
        '0x52e69a7cf5076a769e11fffc2e99e837b575f65e',
        '0x97dbbdba28df6d629bc17e0349bcb73d541ed041',
        '0xb7008ef20fcdc25e91ef0b805f342d2d694de4d2',
        '0xd784b2ee3cd12a93e7ed592e583f6929f2d4e0b2',
      ],
    },
    // {
    //   chain: ChainNames.polygon,
    //   protocol: ProtocolNames.ajna,
    //   metric: DataMetrics.isolatedLending,
    //   version: LendingMarketVersions.isolated.ajna,
    //   birthday: 1705536000, // Thu Jan 18 2024 00:00:00 GMT+0000
    //   address: '0x1f172f881eba06aa7a991651780527c173783cf6', // Pool Factory
    //   whitelistedPools: ['0xeacb97e9490b8ce6228e740104741c74a931a67e'],
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   protocol: ProtocolNames.ajna,
    //   metric: DataMetrics.isolatedLending,
    //   version: LendingMarketVersions.isolated.ajna,
    //   birthday: 1705536000, // Thu Jan 18 2024 00:00:00 GMT+0000
    //   address: '0xa3a1e968bd6c578205e11256c8e6929f21742aaf', // Pool Factory
    //   whitelistedPools: ['0x400975250114cbb4ccc7a2c6cecf88656f4aeb91', '0xbf8e2550242631522fa88fbe4a5262439b07254a'],
    // },
  ],
};
