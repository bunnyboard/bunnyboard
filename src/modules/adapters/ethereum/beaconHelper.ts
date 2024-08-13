// import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
// import { ContextServices } from '../../../types/namespaces';
// import { EthereumBeaconStats } from '../../../types/domains/ecosystem/ethereum';
// import logger from '../../../lib/logger';
// import axios from 'axios';

// export interface GetBeaconDataOptions {
//   services: ContextServices;
//   ethereumConfig: EthereumEcosystemConfig;
// }

// export default class BeaconHelper {
//   public static async getBeaconData(options: GetBeaconDataOptions): Promise<EthereumBeaconStats> {
//     const stats: EthereumBeaconStats = {
//       totalValidator: 0,
//       validatorStatus: {},
//     };

//     const chunk = 1000; // get 1000 validators at once

//     let startIndex = 0;
//     do {
//       let requestUrl = `${options.ethereumConfig.beaconNode}/beacon/states/head/validators?id=`;
//       for (let i = startIndex; i < startIndex + chunk; i++) {
//         requestUrl += `${i},`;
//       }
//       requestUrl = requestUrl.slice(0, -1);

//       const response = await axios.get(requestUrl);
//       if (response.data && response.data.data) {
//         if (response.data.data.length === 0) {
//           break;
//         } else {
//           for (const validator of response.data.data) {
//             stats.totalValidator += 1;
//             if (!stats.validatorStatus[validator.status]) {
//               stats.validatorStatus[validator.status] = 0;
//             }
//             stats.validatorStatus[validator.status] += 1;
//           }
//         }
//       }

//       startIndex += chunk;

//       logger.debug('getting beacon validator info by indies', {
//         service: this.name,
//         toIndex: startIndex,
//       });
//     } while (true);

//     return stats;
//   }
// }
