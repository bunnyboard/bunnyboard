import { expect } from 'chai';
import { describe } from 'mocha';

import { ProtocolConfigs } from '../configs';
import AaveLendingPoolAbiV2 from '../configs/abi/aave/LendingPoolV2.json';
import AaveLendingPoolAbiV3 from '../configs/abi/aave/LendingPoolV3.json';
import CometAbi from '../configs/abi/compound/Comet.json';
import ComptrollerAbi from '../configs/abi/compound/Comptroller.json';
import cErc20Abi from '../configs/abi/compound/cErc20.json';
import GemJoinAbi from '../configs/abi/maker/GemJoin.json';
import { OracleConfigs } from '../configs/oracles/configs';
import { CompoundLendingMarketConfig } from '../configs/protocols/compound';
import { normalizeAddress } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';
import { DataMetrics, LendingMarketConfig, MetricConfig } from '../types/configs';

const blockchain = new BlockchainService();

interface SimpleToken {
  chain: string;
  address: string;
}

async function getLendingMarketTokenNeedOracles(config: LendingMarketConfig): Promise<Array<SimpleToken>> {
  let tokens: Array<SimpleToken> = [];

  const version = (config as LendingMarketConfig).version;
  switch (version) {
    case 'aavev2':
    case 'aavev3': {
      const reserveList = await blockchain.readContract({
        chain: config.chain,
        abi: version === 'aavev2' ? AaveLendingPoolAbiV2 : AaveLendingPoolAbiV3,
        target: config.address,
        method: 'getReservesList',
        params: [],
      });

      tokens = tokens.concat(
        reserveList.map((item: string) => {
          return {
            chain: config.chain,
            address: normalizeAddress(item),
          };
        }),
      );
      break;
    }
    case 'compound': {
      const governanceToken = (config as CompoundLendingMarketConfig).governanceToken;
      if (governanceToken) {
        tokens.push({
          chain: governanceToken.chain,
          address: governanceToken.address,
        });
      }

      const marketList = await blockchain.readContract({
        chain: config.chain,
        abi: ComptrollerAbi,
        target: config.address,
        method: 'getAllMarkets',
        params: [],
      });
      for (const cToken of marketList) {
        const underlying = await blockchain.readContract({
          chain: config.chain,
          abi: cErc20Abi,
          target: cToken,
          method: 'underlying',
          params: [],
        });
        if (underlying) {
          if (config.blacklists && config.blacklists[normalizeAddress(cToken)]) {
            continue;
          }
          tokens.push({
            chain: config.chain,
            address: normalizeAddress(underlying.toString()),
          });
        }
      }
      break;
    }
    case 'compoundv3': {
      if (config.debtToken) {
        tokens.push({
          chain: config.debtToken.chain,
          address: config.debtToken.address,
        });
      }
      const numAssets = await blockchain.readContract({
        chain: config.chain,
        abi: CometAbi,
        target: config.address,
        method: 'numAssets',
        params: [],
      });
      for (let i = 0; i < Number(numAssets); i++) {
        const assetInfo = await blockchain.readContract({
          chain: config.chain,
          abi: CometAbi,
          target: config.address,
          method: 'getAssetInfo',
          params: [i],
        });
        tokens.push({
          chain: config.chain,
          address: normalizeAddress(assetInfo.asset.toString()),
        });
      }
      break;
    }
    case 'liquity': {
      if (config.debtToken) {
        tokens.push({
          chain: config.debtToken.chain,
          address: config.debtToken.address,
        });
      }
      if (config.collateralToken) {
        tokens.push({
          chain: config.collateralToken.chain,
          address: config.collateralToken.address,
        });
      }
      break;
    }
    case 'maker': {
      const gem = await blockchain.readContract({
        chain: config.chain,
        abi: GemJoinAbi,
        target: config.address,
        method: 'gem',
        params: [],
      });
      const token = await blockchain.getTokenInfo({
        chain: config.chain,
        address: gem,
      });
      if (token) {
        tokens.push({
          chain: token.chain,
          address: token.address,
        });
      }
      break;
    }
  }

  return tokens;
}

describe('data and configs', async function () {
  Object.values(ProtocolConfigs).map((protocolConfig) =>
    describe(`should have correct configs for protocol ${protocolConfig.protocol}`, async function () {
      protocolConfig.configs
        .filter((config) => (config as MetricConfig).metric === DataMetrics.lending)
        .map((lendingConfig) =>
          it(`should have correct configs for lending market ${lendingConfig.protocol}:${lendingConfig.chain}:${lendingConfig.address}`, async function () {
            const tokens = await getLendingMarketTokenNeedOracles(lendingConfig as LendingMarketConfig);
            for (const token of tokens) {
              expect(OracleConfigs[token.chain][token.address]).not.equal(
                undefined,
                `should have token oracle config for ${token.chain}:${token.address}`,
              );
            }
          }),
        );
    }),
  );
});
