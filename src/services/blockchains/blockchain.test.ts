import { describe, expect, test } from 'vitest';

import EnvConfig from '../../configs/envConfig';
import BlockchainService from './blockchain';

const blockchain = new BlockchainService();

const testcases = [
  {
    ...EnvConfig.blockchains.ethereum,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 16308190,
  },
  {
    ...EnvConfig.blockchains.arbitrum,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 50084142,
  },
  {
    ...EnvConfig.blockchains.optimism,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 58462112,
  },
  {
    ...EnvConfig.blockchains.polygon,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 37520356,
  },
  {
    ...EnvConfig.blockchains.base,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 8638927,
  },
  {
    ...EnvConfig.blockchains.bnbchain,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 24393652,
  },
  {
    ...EnvConfig.blockchains.fantom,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 53063149,
  },
  {
    ...EnvConfig.blockchains.avalanche,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 24360269,
  },
  {
    ...EnvConfig.blockchains.gnosis,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 25736050,
  },
  {
    ...EnvConfig.blockchains.metis,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 4253471,
  },
  {
    ...EnvConfig.blockchains.bsquared,
    timestamp: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 2018107,
  },
  {
    ...EnvConfig.blockchains.scroll,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 2067751,
  },
  {
    ...EnvConfig.blockchains.blast,
    timestamp: 1708819200, // Sun Feb 25 2024 00:00:00 GMT+0000
    expectedBlockNumber: 4693,
  },
  {
    ...EnvConfig.blockchains.linea,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 1459540,
  },
  {
    ...EnvConfig.blockchains.zksync,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 22909716,
  },
  {
    ...EnvConfig.blockchains.mode,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 1949809,
  },
  {
    ...EnvConfig.blockchains.manta,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 984325,
  },
  {
    ...EnvConfig.blockchains.mantle,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 36794907,
  },
  {
    ...EnvConfig.blockchains.aurora,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 109276896,
  },
  {
    ...EnvConfig.blockchains.polygonzkevm,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 8922197,
  },
  {
    ...EnvConfig.blockchains.zora,
    timestamp: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 8686681,
  },
  {
    ...EnvConfig.blockchains.merlin,
    timestamp: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 10784372,
  },
  {
    ...EnvConfig.blockchains.zklinknova,
    timestamp: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 1091881,
  },
  {
    ...EnvConfig.blockchains.cronos,
    timestamp: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 13728036,
  },
  {
    ...EnvConfig.blockchains.moonbeam,
    timestamp: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 6058082,
  },
  {
    ...EnvConfig.blockchains.moonriver,
    timestamp: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 6661016,
  },
  {
    ...EnvConfig.blockchains.bitlayer,
    timestamp: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 748324,
  },
  {
    ...EnvConfig.blockchains.core,
    timestamp: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 13740382,
  },
  {
    ...EnvConfig.blockchains.taiko,
    timestamp: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 16663,
  },
  {
    ...EnvConfig.blockchains.seievm,
    timestamp: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 80041939,
  },
  {
    ...EnvConfig.blockchains.bob,
    timestamp: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 2169007,
  },
  {
    ...EnvConfig.blockchains.bsquared,
    timestamp: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
    expectedBlockNumber: 2018107,
  },
  {
    ...EnvConfig.blockchains.celo,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 16972631,
  },
  {
    ...EnvConfig.blockchains.ronin,
    timestamp: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
    expectedBlockNumber: 20260913,
  },
];

describe('getBlockNumberAtTimestamp', function () {
  testcases.map((item) =>
    test(`should get block number correctly - ${item.name} - ${item.timestamp} - ${item.expectedBlockNumber}`, async function () {
      const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp(item.name, item.timestamp);
      expect(blockNumber).equal(item.expectedBlockNumber);
    }),
  );
});

// describe('multicall', function () {
//   test('should be able to get token metadata', async function () {
//     const tokens = [
//       {
//         chain: 'ethereum',
//         address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
//         symbol: 'USDT',
//         decimals: 6,
//         blockNumber: 10634748,
//       },
//       {
//         chain: 'bnbchain',
//         address: '0x55d398326f99059ff775485246999027b3197955',
//         symbol: 'USDT',
//         decimals: 18,
//       },
//       {
//         chain: 'arbitrum',
//         address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
//         symbol: 'ARB',
//         decimals: 18,
//       },
//       {
//         chain: 'optimism',
//         address: '0x4200000000000000000000000000000000000042',
//         symbol: 'OP',
//         decimals: 18,
//       },
//     ];

//     for (const token of tokens) {
//       const multicall3Results = await blockchain.multicall3({
//         chain: token.chain,
//         calls: [
//           {
//             target: token.address,
//             abi: ERC20Abi,
//             method: 'symbol',
//             params: [],
//           },
//           {
//             target: token.address,
//             abi: ERC20Abi,
//             method: 'decimals',
//             params: [],
//           },
//         ],
//       });

//       const readContractMultipleResults = await blockchain.multicall({
//         chain: token.chain,
//         blockNumber: token.blockNumber,
//         calls: [
//           {
//             target: token.address,
//             abi: ERC20Abi,
//             method: 'symbol',
//             params: [],
//           },
//           {
//             target: token.address,
//             abi: ERC20Abi,
//             method: 'decimals',
//             params: [],
//           },
//         ],
//       });

//       expect(JSON.stringify(multicall3Results)).equal(JSON.stringify(readContractMultipleResults));

//       expect(multicall3Results[0]).equal(token.symbol);
//       expect(multicall3Results[1]).equal(token.decimals);
//       expect(readContractMultipleResults[0]).equal(token.symbol);
//       expect(readContractMultipleResults[1]).equal(token.decimals);
//     }
//   });
// });
