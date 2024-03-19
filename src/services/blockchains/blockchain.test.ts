import { describe, expect, test } from 'vitest';

import ERC20Abi from '../../configs/abi/ERC20.json';
import BlockchainService from './blockchain';

const blockchain = new BlockchainService();

describe('multicall3', function () {
  test('should be able to get token metadata', async function () {
    const tokens = [
      {
        chain: 'ethereum',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        symbol: 'USDT',
        decimals: 6,
      },
      {
        chain: 'bnbchain',
        address: '0x55d398326f99059ff775485246999027b3197955',
        symbol: 'USDT',
        decimals: 18,
      },
    ];

    for (const token of tokens) {
      const results = await blockchain.multicall3(token.chain, [
        {
          target: token.address,
          abi: ERC20Abi,
          method: 'symbol',
          params: [],
        },
        {
          target: token.address,
          abi: ERC20Abi,
          method: 'decimals',
          params: [],
        },
      ]);

      expect(results[0]).equal(token.symbol);
      expect(results[1]).equal(token.decimals);
    }
  });
});
