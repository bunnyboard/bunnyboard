import * as fs from 'fs';

import { AaveLendingMarketConfig } from '../configs/protocols/aave';
import { KinzaConfigs } from '../configs/protocols/kinza';
import { SeamlessConfigs } from '../configs/protocols/seamless';
import AaveLibs from '../modules/libs/aave';
import { CrossLendingMarketConfig, DataMetrics, Token } from '../types/configs';

const directoryPath = './src/configs/data/tokenlists';

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
    scroll: loadExistedTokens('scroll'),
    blast: loadExistedTokens('blast'),
    linea: loadExistedTokens('linea'),
    zksync: loadExistedTokens('zksync'),
  };

  for (const protocolConfig of [SeamlessConfigs, KinzaConfigs]) {
    for (const config of protocolConfig.configs) {
      if (config.metric === DataMetrics.crossLending) {
        const lendingConfig = config as CrossLendingMarketConfig;
        console.log(
          `getting all tokens metadata from lending market ${lendingConfig.protocol}:${lendingConfig.chain}:${lendingConfig.address}`,
        );

        let tokens: Array<Token> = [];

        if (lendingConfig.version === 'aavev3') {
          const marketInfo = await AaveLibs.getMarketInfo(lendingConfig as AaveLendingMarketConfig);
          if (marketInfo) {
            tokens = marketInfo.reserves;
          }
        } else if (lendingConfig.version === 'compound') {
          // const cTokens = await CompoundLibs.getComptrollerInfo(lendingConfig as CompoundLendingMarketConfig);
          // tokens = cTokens.map((item) => item.underlying);
        }

        for (const token of tokens) {
          tokenByChains[token.chain][token.address] = token;
        }
      }
    }
  }

  for (const [chain, tokens] of Object.entries(tokenByChains)) {
    fs.writeFileSync(`${directoryPath}/${chain}.json`, JSON.stringify(tokens));
  }
})();
