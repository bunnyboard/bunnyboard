import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
import { ContextServices } from '../../../types/namespaces';
import { EthereumBeaconStats } from '../../../types/domains/ecosystem/ethereum';
import logger from '../../../lib/logger';
import axios from 'axios';

export interface GetBeaconDataOptions {
  services: ContextServices;
  ethereumConfig: EthereumEcosystemConfig;
}

export default class BeaconHelper {
  public static async getBeaconData(options: GetBeaconDataOptions): Promise<EthereumBeaconStats> {
    const stats: EthereumBeaconStats = {
      cumulativeValidatorCount: 0,
      validatorStates: {},
    };

    const chunk = 1000; // get 1000 validators at once

    let startIndex = 0;
    do {
      let requestUrl = `${options.ethereumConfig.beaconNode}/beacon/states/head/validators?id=`;
      for (let i = startIndex; i < startIndex + chunk; i++) {
        requestUrl += `${i},`;
      }
      requestUrl = requestUrl.slice(0, -1);

      const response = await axios.get(requestUrl);
      if (response.data && response.data.data) {
        if (response.data.data.length === 0) {
          break;
        } else {
          stats.cumulativeValidatorCount = response.data.data[response.data.data.length - 1].index;

          for (const validator of response.data.data) {
            if (!stats.validatorStates[validator.status]) {
              stats.validatorStates[validator.status] = 0;
            }
            stats.validatorStates[validator.status] += 1;
          }
        }
      }

      startIndex += chunk;

      logger.debug('getting validator info from beacon', {
        service: this.name,
        toIndex: startIndex,
      });
    } while (true);

    return stats;
  }
}
