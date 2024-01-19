// help to get static data from compound finance
import * as fs from 'fs';

import { CompoundConfigs } from '../configs/protocols/compound';
import CompoundLibs from '../modules/libs/compound';
import { DataMetrics, LendingMarketVersions } from '../types/configs';

const dataPath = './src/configs/data/CompoundData.json';

(async function () {
  for (const config of CompoundConfigs.configs) {
    if (config.metric === DataMetrics.crossLending && config.version === LendingMarketVersions.cross.compound) {
      const cTokens = await CompoundLibs.getComptrollerInfo(config);
      fs.writeFileSync(dataPath, JSON.stringify(cTokens));
    }
  }

  process.exit(0);
})();
