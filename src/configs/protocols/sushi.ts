import { ProtocolConfig } from '../../types/configs';

export const SushiConfigs: ProtocolConfig = {
  protocol: 'sushi',
  masterchefs: [
    {
      chain: 'ethereum',
      protocol: 'sushi',
      version: 'master',
      birthday: 1598486400, // Thu Aug 27 2020 00:00:00 GMT+0000
      address: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
      rewardToken: {
        chain: 'ethereum',
        symbol: 'SUSHI',
        decimals: 18,
        address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
      },
    },
  ],
};
