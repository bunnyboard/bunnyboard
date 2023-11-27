import { AaveProtocolConfig } from './aave';

export const RadiantConfigs: AaveProtocolConfig = {
  protocol: 'radiant',
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'radiant',
      version: 'aavev2',
      birthday: 1698710400, // Tue Oct 31 2023 00:00:00 GMT+0000
      address: '0xa950974f64aa33f27f6c5e017eee93bf7588ed07',
      dataProvider: '0x362f3BB63Cff83bd169aE1793979E9e537993813',
    },
    {
      chain: 'arbitrum',
      protocol: 'radiant',
      version: 'aavev2',
      birthday: 1679184000, // Sun Mar 19 2023 00:00:00 GMT+0000
      address: '0xf4b1486dd74d07706052a33d31d7c0aafd0659e1',
      dataProvider: '0x596B0cc4c5094507C50b579a662FE7e7b094A2cC',
    },
    {
      chain: 'bnbchain',
      protocol: 'radiant',
      version: 'aavev2',
      birthday: 1679961600, // Tue Mar 28 2023 00:00:00 GMT+0000
      address: '0xd50cf00b6e600dd036ba8ef475677d816d6c4281',
      dataProvider: '0x2f9D57E97C3DFED8676e605BC504a48E0c5917E9',
    },
  ],
};
