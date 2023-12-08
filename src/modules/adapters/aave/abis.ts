export interface AaveEventInterfaces {
  Deposit: string;
  Withdraw: string;
  Borrow: string;
  Repay: string;
  Liquidate: string;
}

export const Aavev1EventSignatures: AaveEventInterfaces = {
  Deposit: '0xc12c57b1c73a2c3a2ea4613e9476abb3d8d146857aab7329e24243fb59710c82',
  Withdraw: '0x9c4ed599cd8555b9c1e8cd7643240d7d71eb76b792948c49fcb4d411f7b6b3c6',
  Borrow: '0x1e77446728e5558aa1b7e81e0cdab9cc1b075ba893b740600c76a315c2caa553',
  Repay: '0xb718f0b14f03d8c3adf35b15e3da52421b042ac879e5a689011a8b1e0036773d',
  Liquidate: '0x56864757fd5b1fc9f38f5f3a981cd8ae512ce41b902cf73fc506ee369c6bc237',
};

export const Aavev2EventSignatures: AaveEventInterfaces = {
  Deposit: '0xde6857219544bb5b7746f48ed30be6386fefc61b2f864cacf559893bf50fd951',
  Withdraw: '0x3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9f7',
  Borrow: '0xc6a898309e823ee50bac64e45ca8adba6690e99e7841c45d754e2a38e9019d9b',
  Repay: '0x4cdde6e09bb755c9a5589ebaec640bbfedff1362d4b255ebf8339782b9942faa',
  Liquidate: '0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286',
};

export const Aavev3EventSignatures: AaveEventInterfaces = {
  Deposit: '0x2b627736bca15cd5381dcf80b0bf11fd197d01a037c52b927a881a10fb73ba61',
  Withdraw: '0x3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9f7',
  Borrow: '0xb3d084820fb1a9decffb176436bd02558d15fac9b0ddfed8c465bc7359d7dce0',
  Repay: '0xa534c8dbe71f871f9f3530e97a74601fea17b426cae02e1c5aee42c96c784051',
  Liquidate: '0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286',
};

export const Aavev1EventAbiMappings: { [key: string]: Array<any> } = {
  [Aavev1EventSignatures.Deposit]: [
    {
      indexed: true,
      internalType: 'address',
      name: '_reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: '_user',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_amount',
      type: 'uint256',
    },
    {
      indexed: true,
      internalType: 'uint16',
      name: '_referral',
      type: 'uint16',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_timestamp',
      type: 'uint256',
    },
  ],
  [Aavev1EventSignatures.Withdraw]: [
    {
      indexed: true,
      internalType: 'address',
      name: '_reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: '_user',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_amount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_timestamp',
      type: 'uint256',
    },
  ],
  [Aavev1EventSignatures.Borrow]: [
    {
      indexed: true,
      internalType: 'address',
      name: '_reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: '_user',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_amount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_borrowRateMode',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_borrowRate',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_originationFee',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_borrowBalanceIncrease',
      type: 'uint256',
    },
    {
      indexed: true,
      internalType: 'uint16',
      name: '_referral',
      type: 'uint16',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_timestamp',
      type: 'uint256',
    },
  ],
  [Aavev1EventSignatures.Repay]: [
    {
      indexed: true,
      internalType: 'address',
      name: '_reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: '_user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: '_repayer',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_amountMinusFees',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_fees',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_borrowBalanceIncrease',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_timestamp',
      type: 'uint256',
    },
  ],
  [Aavev1EventSignatures.Liquidate]: [
    {
      indexed: true,
      internalType: 'address',
      name: '_collateral',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: '_reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: '_user',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_purchaseAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_liquidatedCollateralAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_accruedBorrowInterest',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'address',
      name: '_liquidator',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'bool',
      name: '_receiveAToken',
      type: 'bool',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: '_timestamp',
      type: 'uint256',
    },
  ],
};

export const Aavev2EventAbiMappings: { [key: string]: Array<any> } = {
  [Aavev2EventSignatures.Deposit]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'reserve',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'onBehalfOf',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
    {
      indexed: true,
      internalType: 'uint16',
      name: 'referral',
      type: 'uint16',
    },
  ],
  [Aavev2EventSignatures.Withdraw]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'to',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
  ],
  [Aavev2EventSignatures.Borrow]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'reserve',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'onBehalfOf',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'borrowRateMode',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'borrowRate',
      type: 'uint256',
    },
    {
      indexed: true,
      internalType: 'uint16',
      name: 'referral',
      type: 'uint16',
    },
  ],
  [Aavev2EventSignatures.Repay]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'repayer',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
  ],
  [Aavev2EventSignatures.Liquidate]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'collateralAsset',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'debtAsset',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'debtToCover',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'liquidatedCollateralAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'liquidator',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'bool',
      name: 'receiveAToken',
      type: 'bool',
    },
  ],
};

export const Aavev3EventAbiMappings: { [key: string]: Array<any> } = {
  [Aavev3EventSignatures.Deposit]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'reserve',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'onBehalfOf',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
    {
      indexed: true,
      internalType: 'uint16',
      name: 'referralCode',
      type: 'uint16',
    },
  ],
  [Aavev3EventSignatures.Withdraw]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'to',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
  ],
  [Aavev3EventSignatures.Borrow]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'reserve',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'onBehalfOf',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'enum DataTypes.InterestRateMode',
      name: 'interestRateMode',
      type: 'uint8',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'borrowRate',
      type: 'uint256',
    },
    {
      indexed: true,
      internalType: 'uint16',
      name: 'referralCode',
      type: 'uint16',
    },
  ],
  [Aavev3EventSignatures.Repay]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'reserve',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'repayer',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'bool',
      name: 'useATokens',
      type: 'bool',
    },
  ],
  [Aavev3EventSignatures.Liquidate]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'collateralAsset',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'debtAsset',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'debtToCover',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'liquidatedCollateralAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'liquidator',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'bool',
      name: 'receiveAToken',
      type: 'bool',
    },
  ],
};
