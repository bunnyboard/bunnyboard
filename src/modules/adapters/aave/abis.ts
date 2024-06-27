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
export const Aavev2FlashloanEventSignature = '0x631042c832b07452973831137f2d73e395028b44b250dedc5abb0ee766e168ac';

export const Aavev3EventSignatures: AaveEventInterfaces = {
  Deposit: '0x2b627736bca15cd5381dcf80b0bf11fd197d01a037c52b927a881a10fb73ba61',
  Withdraw: '0x3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9f7',
  Borrow: '0xb3d084820fb1a9decffb176436bd02558d15fac9b0ddfed8c465bc7359d7dce0',
  Repay: '0xa534c8dbe71f871f9f3530e97a74601fea17b426cae02e1c5aee42c96c784051',
  Liquidate: '0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286',
};
export const Aavev3FlashloanEventSignature = '0xefefaba5e921573100900a3ad9cf29f222d995fb3b6045797eaea7521bd8d6f0';

export interface AaveStakingEventInterfaces {
  Staked: string;
  StakedV2: string;
  Redeem: string;
  RedeemV2: string;
  RewardsAccrued: string;
  RewardsClaimed: string;
}

export const AaveStakingEvents: AaveStakingEventInterfaces = {
  Staked: '0x5dac0c1b1112564a045ba943c9d50270893e8e826c49be8e7073adc713ab7bd7',
  StakedV2: '0x6c86f3fd5118b3aa8bb4f389a617046de0a3d3d477de1a1673d227f802f616dc',
  Redeem: '0xd12200efa34901b99367694174c3b0d32c99585fdf37c7c26892136ddd0836d9',
  RedeemV2: '0x3f693fff038bb8a046aa76d9516190ac7444f7d69cf952c4cbdc086fdef2d6fc',
  RewardsAccrued: '0x2468f9268c60ad90e2d49edb0032c8a001e733ae888b3ab8e982edf535be1a76',
  RewardsClaimed: '0x9310ccfcb8de723f578a9e4282ea9f521f05ae40dc08f3068dfad528a65ee3c7',
};
