export interface AaveEventInterfaces {
  Deposit: string;
  Withdraw: string;
  Borrow: string;
  Repay: string;
  Liquidate: string;
}

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
