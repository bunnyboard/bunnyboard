// import retry from 'async-retry';
// import axios, { RawAxiosRequestHeaders } from 'axios';
// import BigNumber from 'bignumber.js';
//
// import { normalizeAddress } from '../../../lib/utils';
// import { DexConfig, DexSubgraph, ProtocolConfig } from '../../../types/configs';
// import { DexDataTrader } from '../../../types/domains/dex';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import Uniswapv2Adapter, { EventData, FactoryData } from './uniswapv2';
//
// export default class Uniswapv3Adapter extends Uniswapv2Adapter {
//   public readonly name: string = 'adapter.uniswapv3';
//
//   constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
//     super(services, storages, protocolConfig);
//   }
//
//   protected async getFactoryData(
//     subgraphConfig: DexSubgraph,
//     fromBlock: number,
//     toBlock: number,
//   ): Promise<FactoryData | null> {
//     if (subgraphConfig) {
//       const filters = subgraphConfig.filters.factory;
//       const factoryQuery = `
//         {
//           dataFrom: ${filters.factories}(first: 1, block: {number: ${fromBlock}}) {
//             ${filters.volume}
//             ${filters.liquidity}
//             ${filters.txCount}
//             ${filters.fees}
//           }
//           dataTo: ${filters.factories}(first: 1, block: {number: ${toBlock}}) {
//              ${filters.volume}
//             ${filters.liquidity}
//             ${filters.txCount}
//             ${filters.fees}
//           }
//         }
//       `;
//
//       const data = await retry(
//         async function () {
//           const response = await axios.post(
//             subgraphConfig.endpoint,
//             {
//               query: factoryQuery,
//             },
//             {
//               headers: {
//                 'Content-Type': 'application/json',
//               } as RawAxiosRequestHeaders,
//             },
//           );
//
//           return response.data.data;
//         },
//         {
//           retries: 5,
//         },
//       );
//       if (data) {
//         try {
//           const totalVolumeFrom = new BigNumber(data.dataFrom[0][filters.volume].toString());
//           const totalVolumeTo = new BigNumber(data.dataTo[0][filters.volume].toString());
//           const volumeTrading = totalVolumeTo.minus(totalVolumeFrom);
//
//           const feesTradingFrom = filters.fees
//             ? new BigNumber(data.dataFrom[0][filters.fees].toString())
//             : new BigNumber(0);
//           const feesTradingTo = filters.fees
//             ? new BigNumber(data.dataTo[0][filters.fees].toString())
//             : new BigNumber(0);
//           const feesTrading = feesTradingTo.minus(feesTradingFrom);
//
//           return {
//             totalLiquidity: data.dataTo[0][filters.liquidity].toString(),
//             feesTrading: feesTrading.toString(10),
//             volumeTrading: volumeTrading.toString(10),
//             numberOfTransactions: Number(data.dataTo[0][filters.txCount]) - Number(data.dataFrom[0][filters.txCount]),
//           };
//         } catch (e: any) {}
//       }
//     }
//
//     return null;
//   }
//
//   protected async getEventData(dexConfig: DexConfig, fromTime: number, toTime: number): Promise<EventData | null> {
//     const subgraphConfig = dexConfig.subgraph;
//
//     if (subgraphConfig && subgraphConfig.filters.eventSwaps) {
//       const filters = subgraphConfig.filters.eventSwaps;
//
//       let timestamp = fromTime;
//       const transactionIds: { [key: string]: boolean } = {};
//       const traders: { [key: string]: DexDataTrader } = {};
//       do {
//         const eventSwapsQuery = `
//           {
//             swaps: ${filters.event}(first: 1000, where: { timestamp_gte: ${timestamp}, timestamp_lte: ${toTime} }, orderBy: timestamp, orderDirection: asc) {
//               id
//               ${filters.trader}
//               ${filters.volumeUsd}
//               ${filters.timestamp}
//             }
//           }
//         `;
//
//         const data = await retry(
//           async function () {
//             const response = await axios.post(
//               subgraphConfig.endpoint,
//               {
//                 query: eventSwapsQuery,
//               },
//               {
//                 headers: {
//                   'Content-Type': 'application/json',
//                 } as RawAxiosRequestHeaders,
//               },
//             );
//
//             return response.data.data;
//           },
//           {
//             retries: 5,
//           },
//         );
//
//         const swapEvents = data.swaps ? (data.swaps as Array<any>) : [];
//         for (const swapEvent of swapEvents) {
//           if (!transactionIds[swapEvent.id]) {
//             transactionIds[swapEvent.id] = true;
//
//             const trader = normalizeAddress(swapEvent[filters.trader]);
//             if (!traders[trader]) {
//               traders[trader] = {
//                 address: trader,
//                 volumeUsd: '0',
//               };
//             }
//
//             traders[trader].volumeUsd = new BigNumber(traders[trader].volumeUsd)
//               .plus(new BigNumber(swapEvent[filters.volumeUsd].toString()))
//               .toString(10);
//           }
//         }
//
//         timestamp =
//           swapEvents.length > 0 ? Number(swapEvents[swapEvents.length - 1][filters.timestamp]) + 1 : toTime + 1;
//       } while (timestamp <= toTime);
//
//       return {
//         traders: Object.values(traders),
//       };
//     }
//
//     return null;
//   }
// }
