// import BigNumber from 'bignumber.js';
// import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
// import logger from '../../../lib/logger';
// import { formatBigNumberToString, formatTime, normalizeAddress } from '../../../lib/utils';
// import { EthereumMinerStats, EthereumAddressStats } from '../../../types/domains/ecosystem/ethereum';
// import { ContextServices } from '../../../types/namespaces';
// import envConfig from '../../../configs/envConfig';
// import axios from 'axios';

// export interface GetChainStatsOptions {
//   services: ContextServices;
//   ethereumConfig: EthereumEcosystemConfig;
//   beginBlock: number;
//   endBlock: number;
// }

// export interface GetChainStatsResult {
//   gasLimit: string;
//   gasUsed: string;
//   totalBeaconWithdrawn: string;
//   totalFeesBurnt: string;
//   totalFeesPaid: string;
//   transactionCount: number;
//   transactionTypes: { [key: string]: number };
//   senderAddresses: Array<EthereumAddressStats>;
//   guzzlerAddresses: Array<EthereumAddressStats>;
//   minerAddresses: Array<EthereumMinerStats>;
// }

// export default class ChainHelper {
//   public static async getTransactionReceipts(blockNumber: number): Promise<any> {
//     // https://docs.alchemy.com/reference/alchemy-gettransactionreceipts
//     const response = await axios.post(`https://eth-mainnet.g.alchemy.com/v2/${envConfig.externalConfigs.alchemyKey}`, {
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'alchemy_getTransactionReceipts',
//       params: [
//         {
//           blockNumber: `0x${blockNumber.toString(16)}`,
//         },
//       ],
//     });
//     if (response && response.data) {
//       return response.data.result.receipts;
//     }

//     return null;
//   }

//   public static async getChainStats(options: GetChainStatsOptions): Promise<GetChainStatsResult> {
//     const { ethereumConfig, beginBlock, endBlock } = options;

//     const ethereumData: GetChainStatsResult = {
//       gasLimit: '0',
//       gasUsed: '0',
//       totalBeaconWithdrawn: '0',
//       totalFeesBurnt: '0',
//       totalFeesPaid: '0',
//       transactionCount: 0,
//       transactionTypes: {},
//       senderAddresses: [],
//       guzzlerAddresses: [],
//       minerAddresses: [],
//     };

//     const senderAddresses: { [key: string]: EthereumAddressStats } = {};
//     const guzzlerAddresses: { [key: string]: EthereumAddressStats } = {};
//     const minerAddresses: { [key: string]: EthereumMinerStats } = {};
//     for (let queryBlock = beginBlock; queryBlock <= endBlock; queryBlock++) {
//       // get block and all transaction receipts
//       const block = await options.services.blockchain.getBlock(options.ethereumConfig.chain, queryBlock);
//       const transactionReceipts = await ChainHelper.getTransactionReceipts(options, queryBlock);

//       if (block && transactionReceipts) {
//         const miner = normalizeAddress(block.miner);
//         if (!minerAddresses[miner]) {
//           minerAddresses[miner] = {
//             address: miner,
//             producedBlockCount: 0,
//             feesEarned: '0',
//           };
//         }
//         minerAddresses[miner].producedBlockCount += 1;

//         // count gas
//         ethereumData.gasLimit = new BigNumber(ethereumData.gasLimit)
//           .plus(new BigNumber(block.gasLimit.toString()))
//           .toString(10);
//         ethereumData.gasUsed = new BigNumber(ethereumData.gasUsed)
//           .plus(new BigNumber(block.gasUsed.toString()))
//           .toString(10);

//         // count ETH fees burnt
//         const feesBurnt = new BigNumber(block.gasUsed.toString())
//           .multipliedBy(new BigNumber(block.baseFeePerGas ? block.baseFeePerGas.toString() : '0'))
//           .dividedBy(1e18);
//         ethereumData.totalFeesBurnt = new BigNumber(ethereumData.totalFeesBurnt).plus(feesBurnt).toString(10);

//         // count number of transactions
//         ethereumData.transactionCount += block.transactions.length;

//         // count beacon withdraw
//         if (block.withdrawals) {
//           for (const withdrawal of block.withdrawals) {
//             ethereumData.totalBeaconWithdrawn = new BigNumber(ethereumData.totalBeaconWithdrawn)
//               .plus(formatBigNumberToString(withdrawal.amount.toString(), 9))
//               .toString(10);
//           }
//         }

//         // count transaction types
//         for (const transaction of block.transactions) {
//           if (!ethereumData.transactionTypes[transaction.type]) {
//             ethereumData.transactionTypes[transaction.type] = 0;
//           }
//           ethereumData.transactionTypes[transaction.type] += 1;
//         }

//         // process receipts
//         for (const receipt of transactionReceipts) {
//           // fees paid and fees burnt
//           const transactionFeePaid = new BigNumber(receipt.gasUsed.toString(), 16)
//             .multipliedBy(new BigNumber(receipt.effectiveGasPrice.toString(), 16))
//             .dividedBy(1e18);
//           const transactionFeeBurnt = new BigNumber(receipt.gasUsed.toString(), 16)
//             .multipliedBy(block.baseFeePerGas.toString(10))
//             .dividedBy(1e18);

//           // count transaction fees paid
//           ethereumData.totalFeesPaid = new BigNumber(ethereumData.totalFeesPaid).plus(transactionFeePaid).toString(10);

//           // count ETH earned to minter/validator
//           const minerEarned = new BigNumber(transactionFeePaid).minus(transactionFeeBurnt);
//           minerAddresses[miner].feesEarned = new BigNumber(minerAddresses[miner].feesEarned)
//             .plus(minerEarned)
//             .toString(10);

//           // update sender addresses
//           const sender = normalizeAddress(receipt.from);
//           if (!senderAddresses[sender]) {
//             senderAddresses[sender] = {
//               address: sender,
//               totalGasUsed: '0',
//               totalFeesBurnt: '0',
//               totalFeesPaid: '0',
//               transactionCount: 0,
//             };
//           }
//           senderAddresses[sender].transactionCount += 1;
//           senderAddresses[sender].totalGasUsed = new BigNumber(senderAddresses[sender].totalGasUsed)
//             .plus(new BigNumber(receipt.gasUsed.toString(), 16))
//             .toString(10);
//           senderAddresses[sender].totalFeesPaid = new BigNumber(senderAddresses[sender].totalFeesPaid)
//             .plus(transactionFeePaid)
//             .toString(10);
//           senderAddresses[sender].totalFeesBurnt = new BigNumber(senderAddresses[sender].totalFeesBurnt)
//             .plus(transactionFeeBurnt)
//             .toString(10);

//           // update guzzler (contract/address called) addresses
//           const guzzler = normalizeAddress(receipt.to ? receipt.to : '');
//           if (guzzler !== '') {
//             if (!guzzlerAddresses[guzzler]) {
//               guzzlerAddresses[guzzler] = {
//                 address: guzzler,
//                 totalGasUsed: '0',
//                 totalFeesBurnt: '0',
//                 totalFeesPaid: '0',
//                 transactionCount: 0,
//               };
//             }
//             guzzlerAddresses[guzzler].transactionCount += 1;
//             guzzlerAddresses[guzzler].totalGasUsed = new BigNumber(guzzlerAddresses[guzzler].totalGasUsed)
//               .plus(new BigNumber(receipt.gasUsed.toString(), 16))
//               .toString(10);
//             guzzlerAddresses[guzzler].totalFeesPaid = new BigNumber(guzzlerAddresses[guzzler].totalFeesPaid)
//               .plus(transactionFeePaid)
//               .toString(10);
//             guzzlerAddresses[guzzler].totalFeesBurnt = new BigNumber(guzzlerAddresses[guzzler].totalFeesBurnt)
//               .plus(transactionFeeBurnt)
//               .toString(10);
//           }

//           // process transaction logs
//           for (const log of receipt.logs) {

//           }
//         }

//         logger.debug('processed ethereum block data', {
//           service: this.name,
//           chain: ethereumConfig.chain,
//           protocol: ethereumConfig.protocol,
//           number: queryBlock,
//           age: formatTime(Number(block.timestamp)),
//         });
//       } else {
//         logger.warn('failed to get ethereum block data', {
//           service: this.name,
//           chain: ethereumConfig.chain,
//           protocol: ethereumConfig.protocol,
//           number: queryBlock,
//         });
//       }
//     }

//     ethereumData.senderAddresses = Object.values(senderAddresses);
//     ethereumData.guzzlerAddresses = Object.values(guzzlerAddresses);
//     ethereumData.minerAddresses = Object.values(minerAddresses);

//     return ethereumData;
//   }
// }
