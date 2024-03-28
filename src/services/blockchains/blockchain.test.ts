import { describe, expect, test } from 'vitest';

import ERC20Abi from '../../configs/abi/ERC20.json';
import EnvConfig from '../../configs/envConfig';
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

const testcases = [
  {
    ...EnvConfig.blockchains.ethereum,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 16308189,
  },
  {
    ...EnvConfig.blockchains.arbitrum,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 50084143,
  },
  {
    ...EnvConfig.blockchains.optimism,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 58462085,
  },
  {
    ...EnvConfig.blockchains.polygon,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 37520355,
  },
  {
    ...EnvConfig.blockchains.base,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 8638926,
  },
  {
    ...EnvConfig.blockchains.bnbchain,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 24393651,
  },
  {
    ...EnvConfig.blockchains.fantom,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 53063148,
  },
  {
    ...EnvConfig.blockchains.avalanche,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 24360268,
  },
  {
    ...EnvConfig.blockchains.gnosis,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 25736050,
  },
  {
    ...EnvConfig.blockchains.metis,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 4253470,
  },
];

describe('getBlockNumberAtTimestamp', function () {
  testcases.map((item) =>
    test(`should get block number correctly - ${item.name} - ${item.timestamp} - ${item.expectedBlockNumber}`, async function () {
      const blockNumber = await blockchain.getBlockNumberAtTimestamp(item.name, item.timestamp);
      expect(blockNumber).equal(item.expectedBlockNumber);
    }),
  );
});
