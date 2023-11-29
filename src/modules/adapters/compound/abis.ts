export interface CompoundEventInterfaces {
  AccrueInterest: string;
  AccrueInterestEther: string; // cEther market
  Mint: string;
  Redeem: string;
  Borrow: string;
  Repay: string;
  Liquidate: string;
}

export const CompoundEventSignatures: CompoundEventInterfaces = {
  AccrueInterestEther: '0x875352fb3fadeb8c0be7cbbe8ff761b308fa7033470cd0287f02f3436fd76cb9',
  AccrueInterest: '0x4dec04e750ca11537cabcd8a9eab06494de08da3735bc8871cd41250e190bc04',
  Mint: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
  Redeem: '0xe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4ec31a929',
  Borrow: '0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80',
  Repay: '0x1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0355478d6f5c362a1',
  Liquidate: '0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52',
};

export const CompoundEventAbiMappings: { [key: string]: Array<any> } = {
  [CompoundEventSignatures.AccrueInterestEther]: [
    {
      indexed: false,
      name: 'interestAccumulated',
      type: 'uint256',
    },
    {
      indexed: false,
      name: 'borrowIndex',
      type: 'uint256',
    },
    {
      indexed: false,
      name: 'totalBorrows',
      type: 'uint256',
    },
  ],
  [CompoundEventSignatures.AccrueInterest]: [
    {
      indexed: false,
      internalType: 'uint256',
      name: 'cashPrior',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'interestAccumulated',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'borrowIndex',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'totalBorrows',
      type: 'uint256',
    },
  ],

  [CompoundEventSignatures.Mint]: [
    {
      indexed: false,
      internalType: 'address',
      name: 'minter',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'mintAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'mintTokens',
      type: 'uint256',
    },
  ],
  [CompoundEventSignatures.Redeem]: [
    {
      indexed: false,
      internalType: 'address',
      name: 'redeemer',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'redeemAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'redeemTokens',
      type: 'uint256',
    },
  ],
  [CompoundEventSignatures.Borrow]: [
    {
      indexed: false,
      internalType: 'address',
      name: 'borrower',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'borrowAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'accountBorrows',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'totalBorrows',
      type: 'uint256',
    },
  ],
  [CompoundEventSignatures.Repay]: [
    {
      indexed: false,
      internalType: 'address',
      name: 'payer',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'borrower',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'repayAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'accountBorrows',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'totalBorrows',
      type: 'uint256',
    },
  ],
  [CompoundEventSignatures.Liquidate]: [
    {
      indexed: false,
      internalType: 'address',
      name: 'liquidator',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'borrower',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'repayAmount',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'cTokenCollateral',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'seizeTokens',
      type: 'uint256',
    },
  ],
};
