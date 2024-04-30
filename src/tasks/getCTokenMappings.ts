// help to get underlying token of cToken (Compound Finance) markets
import * as fs from 'fs';

import { ProtocolConfigs } from '../configs';
import { CompoundLendingMarketConfig } from '../configs/protocols/compound';
import CompoundLibs from '../modules/libs/compound';
import { DataMetrics, LendingMarketVersions, Token } from '../types/configs';

const dataPath = './src/configs/data/statics/cTokenMappings.json';
const tokenListPath = './src/configs/data/tokenlists';

(async function () {
  // cTokenAddress => underlying token
  const mappings: { [key: string]: Token } = {};

  for (const protocolConfig of Object.values(ProtocolConfigs)) {
    for (const config of protocolConfig.configs) {
      const marketConfig = config as CompoundLendingMarketConfig;
      if (config.metric === DataMetrics.crossLending && marketConfig.version === LendingMarketVersions.cross.compound) {
        console.log(
          `Getting cTokens mapping got market ${marketConfig.protocol} ${marketConfig.chain} ${marketConfig.address}`,
        );

        const cTokens = await CompoundLibs.getComptrollerInfo(marketConfig);

        for (const cToken of cTokens) {
          mappings[cToken.cToken] = cToken.underlying;

          if (fs.existsSync(`${tokenListPath}/${cToken.chain}.json`)) {
            const existingTokens = JSON.parse(fs.readFileSync(`${tokenListPath}/${cToken.chain}.json`).toString());
            existingTokens[cToken.underlying.address] = cToken.underlying;
            fs.writeFileSync(`${tokenListPath}/${cToken.chain}.json`, JSON.stringify(existingTokens));
          }
        }
      }
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(mappings).toString());

  process.exit(0);
})();
