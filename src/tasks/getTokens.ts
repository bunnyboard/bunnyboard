import * as fs from 'fs';

import { ProtocolConfigs } from '../configs';
import { AaveLendingMarketConfig } from '../configs/protocols/aave';
import { CompoundLendingMarketConfig } from '../configs/protocols/compound';
import AaveLibs from '../modules/libs/aave';
import CompoundLibs from '../modules/libs/compound';
// import GmxLibs from '../modules/libs/gmx';
import {
  CrossLendingMarketConfig,
  DataMetrics, // PerpetualMarketConfig,
  // PerpetualMarketVersions,
  Token,
} from '../types/configs';

const directoryPath = './src/configs/tokenlists';

function loadExistedTokens(chain: string) {
  if (fs.existsSync(`${directoryPath}/${chain}.json`)) {
    return JSON.parse(fs.readFileSync(`${directoryPath}/${chain}.json`).toString());
  }

  return {};
}

(async function () {
  const tokenByChains: any = {
    ethereum: loadExistedTokens('ethereum'),
    arbitrum: loadExistedTokens('arbitrum'),
    polygon: loadExistedTokens('polygon'),
    optimism: loadExistedTokens('optimism'),
    bnbchain: loadExistedTokens('bnbchain'),
    base: loadExistedTokens('base'),
    fantom: loadExistedTokens('fantom'),
    avalanche: loadExistedTokens('avalanche'),
    metis: loadExistedTokens('metis'),
    gnosis: loadExistedTokens('gnosis'),
  };

  for (const protocolConfig of Object.values(ProtocolConfigs)) {
    for (const config of protocolConfig.configs) {
      if (config.metric === DataMetrics.crossLending) {
        const lendingConfig = config as CrossLendingMarketConfig;
        console.log(
          `getting all tokens metadata from lending market ${lendingConfig.protocol}:${lendingConfig.chain}:${lendingConfig.address}`,
        );

        let tokens: Array<Token> = [];

        if (lendingConfig.version === 'aavev2' || lendingConfig.version === 'aavev3') {
          const marketInfo = await AaveLibs.getMarketInfo(lendingConfig as AaveLendingMarketConfig);
          if (marketInfo) {
            tokens = marketInfo.reserves;
          }
        } else if (lendingConfig.version === 'compound') {
          const cTokens = await CompoundLibs.getComptrollerInfo(lendingConfig as CompoundLendingMarketConfig);
          tokens = cTokens.map((item) => item.underlying);
        }

        for (const token of tokens) {
          tokenByChains[token.chain][token.address] = token;
        }
      }
      // else if (config.metric === DataMetrics.perpetual) {
      //   const perpetualConfig = config as PerpetualMarketConfig;
      //   console.log(
      //     `getting all tokens metadata from perpetual market ${perpetualConfig.protocol}:${perpetualConfig.chain}:${perpetualConfig.address}`,
      //   );
      //   if (perpetualConfig.version === PerpetualMarketVersions.gmx) {
      //     const vaultInfo = await GmxLibs.getVaultInfo(perpetualConfig.chain, perpetualConfig.address);
      //     for (const token of vaultInfo.tokens) {
      //       tokenByChains[token.chain][token.address] = token;
      //     }
      //   } else if (perpetualConfig.version === PerpetualMarketVersions.gmxv2) {
      //     const pools = await GmxLibs.getMarketListV2(perpetualConfig as Gmxv2PerpetualMarketConfig);
      //     for (const pool of pools) {
      //       tokenByChains[pool.chain][pool.indexToken.address] = pool.indexToken;
      //       tokenByChains[pool.chain][pool.longToken.address] = pool.longToken;
      //       tokenByChains[pool.chain][pool.shortToken.address] = pool.shortToken;
      //     }
      //   }
      // }
      else {
        console.log(`warning: cannot recognize config metric ${config.metric} protocol ${config.protocol}`);
      }
    }
  }

  for (const [chain, tokens] of Object.entries(tokenByChains)) {
    fs.writeFileSync(`${directoryPath}/${chain}.json`, JSON.stringify(tokens));
  }
})();
