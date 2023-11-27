import { ContractConfig } from '../types/configs';
import { Aavev1Configs, Aavev2Configs, Aavev3Configs } from './protocols/aave';
import { CompoundConfigs } from './protocols/compound';
import { IronbankConfigs } from './protocols/ironbank';
import { VenusConfigs } from './protocols/venus';

export const ContractConfigs: Array<ContractConfig> = [
  ...Aavev1Configs.lendingMarkets.map((item) => {
    return {
      chain: item.chain,
      tag: item.protocol,
      address: item.address,
      birthday: item.birthday,
      logFilters: [
        {
          topic0: '0xc12c57b1c73a2c3a2ea4613e9476abb3d8d146857aab7329e24243fb59710c82',
        },
        {
          topic0: '0x9c4ed599cd8555b9c1e8cd7643240d7d71eb76b792948c49fcb4d411f7b6b3c6',
        },
        {
          topic0: '0x1e77446728e5558aa1b7e81e0cdab9cc1b075ba893b740600c76a315c2caa553',
        },
        {
          topic0: '0xb718f0b14f03d8c3adf35b15e3da52421b042ac879e5a689011a8b1e0036773d',
        },
        {
          topic0: '0x5b8f46461c1dd69fb968f1a003acee221ea3e19540e350233b612ddb43433b55',
        },
        {
          topic0: '0x56864757fd5b1fc9f38f5f3a981cd8ae512ce41b902cf73fc506ee369c6bc237',
        },
      ],
    };
  }),
  ...Aavev2Configs.lendingMarkets.map((item) => {
    return {
      chain: item.chain,
      tag: item.protocol,
      address: item.address,
      birthday: item.birthday,
      logFilters: [
        {
          topic0: '0xde6857219544bb5b7746f48ed30be6386fefc61b2f864cacf559893bf50fd951',
        },
        {
          topic0: '0x3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9f7',
        },
        {
          topic0: '0xc6a898309e823ee50bac64e45ca8adba6690e99e7841c45d754e2a38e9019d9b',
        },
        {
          topic0: '0x4cdde6e09bb755c9a5589ebaec640bbfedff1362d4b255ebf8339782b9942faa',
        },
        {
          topic0: '0x631042c832b07452973831137f2d73e395028b44b250dedc5abb0ee766e168ac',
        },
        {
          topic0: '0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286',
        },
      ],
    };
  }),
  ...Aavev3Configs.lendingMarkets.map((item) => {
    return {
      chain: item.chain,
      tag: item.protocol,
      address: item.address,
      birthday: item.birthday,
      logFilters: [
        {
          topic0: '0x2b627736bca15cd5381dcf80b0bf11fd197d01a037c52b927a881a10fb73ba61',
        },
        {
          topic0: '0x3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9f7',
        },
        {
          topic0: '0xb3d084820fb1a9decffb176436bd02558d15fac9b0ddfed8c465bc7359d7dce0',
        },
        {
          topic0: '0xa534c8dbe71f871f9f3530e97a74601fea17b426cae02e1c5aee42c96c784051',
        },
        {
          topic0: '0xefefaba5e921573100900a3ad9cf29f222d995fb3b6045797eaea7521bd8d6f0',
        },
        {
          topic0: '0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286',
        },
      ],
    };
  }),
  ...CompoundConfigs.lendingMarkets.map((item) => {
    return {
      chain: item.chain,
      tag: item.protocol,
      address: item.address,
      birthday: item.birthday,
      logFilters: [
        {
          topic0: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
        },
        {
          topic0: '0xe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4ec31a929',
        },
        {
          topic0: '0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80',
        },
        {
          topic0: '0x1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0355478d6f5c362a1',
        },
        {
          topic0: '0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52',
        },
        {
          topic0: '0x875352fb3fadeb8c0be7cbbe8ff761b308fa7033470cd0287f02f3436fd76cb9',
        },
      ],
    };
  }),
  ...IronbankConfigs.lendingMarkets.map((item) => {
    return {
      chain: item.chain,
      tag: item.protocol,
      address: item.address,
      birthday: item.birthday,
      logFilters: [
        {
          topic0: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
        },
        {
          topic0: '0xe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4ec31a929',
        },
        {
          topic0: '0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80',
        },
        {
          topic0: '0x1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0355478d6f5c362a1',
        },
        {
          topic0: '0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52',
        },
        {
          topic0: '0x875352fb3fadeb8c0be7cbbe8ff761b308fa7033470cd0287f02f3436fd76cb9',
        },
      ],
    };
  }),
  ...VenusConfigs.lendingMarkets.map((item) => {
    return {
      chain: item.chain,
      tag: item.protocol,
      address: item.address,
      birthday: item.birthday,
      logFilters: [
        {
          topic0: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
        },
        {
          topic0: '0xe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4ec31a929',
        },
        {
          topic0: '0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80',
        },
        {
          topic0: '0x1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0355478d6f5c362a1',
        },
        {
          topic0: '0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52',
        },
        {
          topic0: '0x875352fb3fadeb8c0be7cbbe8ff761b308fa7033470cd0287f02f3436fd76cb9',
        },
      ],
    };
  }),
];
