import { describe, expect, test } from 'vitest';

import { TokenListBase } from '../../configs';
import { DexscanConfigs } from '../../configs/boards/dexscan';
import { ProtocolNames } from '../../configs/names';
import { DexVersions, Token } from '../../types/configs';
import UniswapLibs from '../libs/uniswap';

const tokens = {
  ethereum: TokenListBase.ethereum.WETH,
  arbitrum: TokenListBase.arbitrum.WETH,
  optimism: TokenListBase.optimism.WETH,
  base: TokenListBase.base.WETH,
  polygon: TokenListBase.polygon.WMATIC,
  bnbchain: TokenListBase.bnbchain.WBNB,
  avalanche: TokenListBase.avalanche.WAVAX,
  fantom: TokenListBase.fantom.WFTM,
  gnosis: TokenListBase.gnosis.WXDAI,
};

const blocks = {
  ethereum: {
    blockNumber: 19490072,
    blockNumberAfter: 19495184,
  },
  arbitrum: {
    blockNumber: 194115153,
    blockNumberAfter: 194116153,
  },
  optimism: {
    blockNumber: 117696686,
    blockNumberAfter: 117796686,
  },
  base: {
    blockNumber: 12101410,
    blockNumberAfter: 12111410,
  },
  bnbchain: {
    blockNumber: 35285204,
    blockNumberAfter: 36285204,
  },
  polygon: {
    blockNumber: 55012096,
    blockNumberAfter: 55022096,
  },
  fantom: {
    blockNumber: 78112973,
    blockNumberAfter: 78122973,
  },
  avalanche: {
    blockNumber: 43166021,
    blockNumberAfter: 43266021,
  },
  gnosis: {
    blockNumber: 33012076,
    blockNumberAfter: 33052076,
  },
};

describe('should get dex data correctly', async function () {
  DexscanConfigs.map((dexConfig) =>
    test(`should get dex data correctly - ${dexConfig.protocol} - ${dexConfig.chain}`, async function () {
      const tokenData = await UniswapLibs.getLiquidityTokenSnapshot({
        token: (tokens as any)[dexConfig.chain] as Token,
        dexConfig: dexConfig,
        fromBlock: (blocks as any)[dexConfig.chain].blockNumber,
        toBlock: (blocks as any)[dexConfig.chain].blockNumberAfter,
      });

      expect(tokenData).not.equal(null);

      const pools = await UniswapLibs.getTopLiquidityPoolForToken({
        dexConfig: dexConfig,
        token: (tokens as any)[dexConfig.chain] as Token,
        fromBlock: (blocks as any)[dexConfig.chain].blockNumber,
        toBlock: (blocks as any)[dexConfig.chain].blockNumberAfter,
      });

      if (pools[0]) {
        if (dexConfig.version === DexVersions.univ2) {
          if (dexConfig.protocol === ProtocolNames.uniswapv2 || dexConfig.protocol === ProtocolNames.sushi) {
            expect(pools[0].feesPercentage).equal(0.3);
          } else if (dexConfig.protocol === ProtocolNames.pancake) {
            expect(pools[0].feesPercentage).equal(0.25);
          } else if (dexConfig.protocol === ProtocolNames.spooky) {
            expect(pools[0].feesPercentage).equal(0.2);
          }
        }
      }
    }),
  );
});
