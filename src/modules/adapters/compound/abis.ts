export interface CompoundEventInterfaces {
  Mint: string;
  Redeem: string;
  Borrow: string;
  Repay: string;
  Liquidate: string;
  DistributedSupplierRewards: string;
  DistributedBorrowerRewards: string;
}

export const CompoundEventSignatures: CompoundEventInterfaces = {
  Mint: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
  Redeem: '0xe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4ec31a929',
  Borrow: '0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80',
  Repay: '0x1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0355478d6f5c362a1',
  Liquidate: '0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52',
  DistributedSupplierRewards: '0x2caecd17d02f56fa897705dcc740da2d237c373f70686f4e0d9bd3bf0400ea7a',
  DistributedBorrowerRewards: '0x1fc3ecc087d8d2d15e23d0032af5a47059c3892d003d8e139fdcb6bb327c99a6',
};

export interface Compoundv3EventInterfaces {
  Supply: string;
  Withdraw: string;
  SupplyCollateral: string;
  WithdrawCollateral: string;
  AbsorbDebt: string;
  AbsorbCollateral: string;
  RewardClaimed: string;
}

export const Compoundv3EventSignatures: Compoundv3EventInterfaces = {
  Supply: '0xd1cf3d156d5f8f0d50f6c122ed609cec09d35c9b9fb3fff6ea0959134dae424e',
  Withdraw: '0x9b1bfa7fa9ee420a16e124f794c35ac9f90472acc99140eb2f6447c714cad8eb',
  SupplyCollateral: '0xfa56f7b24f17183d81894d3ac2ee654e3c26388d17a28dbd9549b8114304e1f4',
  WithdrawCollateral: '0xd6d480d5b3068db003533b170d67561494d72e3bf9fa40a266471351ebba9e16',
  AbsorbDebt: '0x1547a878dc89ad3c367b6338b4be6a65a5dd74fb77ae044da1e8747ef1f4f62f',
  AbsorbCollateral: '0x9850ab1af75177e4a9201c65a2cf7976d5d28e40ef63494b44366f86b2f9412e',
  RewardClaimed: '0x2422cac5e23c46c890fdcf42d0c64757409df6832174df639337558f09d99c68',
};
