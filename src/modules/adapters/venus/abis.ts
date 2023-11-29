import { CompoundEventInterfaces } from '../compound/abis';

export const VenusIsolatedEventSignatures: CompoundEventInterfaces = {
  AccrueInterestEther: '', // don't use

  Mint: '0xb4c03061fb5b7fed76389d5af8f2e0ddb09f8c70d1333abbb62582835e10accb',
  Redeem: '0xbd5034ffbd47e4e72a94baa2cdb74c6fad73cb3bcdc13036b72ec8306f5a7646',
  Borrow: '0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80',
  Repay: '0x1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0355478d6f5c362a1',
  Liquidate: '0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52',
  AccrueInterest: '0x4dec04e750ca11537cabcd8a9eab06494de08da3735bc8871cd41250e190bc04',
};

export const VenusIsolatedEventAbiMappings: { [key: string]: Array<any> } = {
  [VenusIsolatedEventSignatures.Mint]: [
    {
      indexed: true,
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
    {
      indexed: false,
      internalType: 'uint256',
      name: 'accountBalance',
      type: 'uint256',
    },
  ],
  [VenusIsolatedEventSignatures.Redeem]: [
    {
      indexed: true,
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
    {
      indexed: false,
      internalType: 'uint256',
      name: 'accountBalance',
      type: 'uint256',
    },
  ],
  [VenusIsolatedEventSignatures.Borrow]: [
    {
      indexed: true,
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
  [VenusIsolatedEventSignatures.Repay]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'payer',
      type: 'address',
    },
    {
      indexed: true,
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
  [VenusIsolatedEventSignatures.Liquidate]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'liquidator',
      type: 'address',
    },
    {
      indexed: true,
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
      indexed: true,
      internalType: 'address',
      name: 'vTokenCollateral',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'seizeTokens',
      type: 'uint256',
    },
  ],
  [VenusIsolatedEventSignatures.AccrueInterest]: [
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
};
