// import { DexConfig, ProtocolConfig, Token } from '../../../types/configs';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import DexProtocolAdapter from '../dex';
// import { DexLiquidityPoolDataTimeframe, DexLiquidityPoolMetadata } from '../../../types/domains/dex';
// import { GetAdapterDataTimeframeOptions } from '../../../types/options';
// import envConfig from '../../../configs/envConfig';
// import logger from '../../../lib/logger';
// import { BalancerEventSignatures } from './abis';
// import BalancerVaultAbi from '../../../configs/abi/balancer/Vault.json';
// import BalancerPoolAbi from '../../../configs/abi/balancer/ComposableStablePool.json';
// import { decodeEventLog } from 'viem';
// import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
// import { TokenDexBase } from '../../../configs';

// export default class BalancerDexAdapter extends DexProtocolAdapter {
//   public readonly name: string = 'adapter.balancer ⚖';

//   constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
//     super(services, storages, protocolConfig);
//   }

//   public async getDexLiquidityPoolMetadata(dexConfig: DexConfig): Promise<Array<DexLiquidityPoolMetadata>> {
//     const liquidityPools: Array<DexLiquidityPoolMetadata> = [];

//     // find the latest block number when events was synced from database
//     let startFromBlock = dexConfig.birthblock ? dexConfig.birthblock : 0;
//     const latestBlock = await this.services.blockchain.getLastestBlockNumber(dexConfig.chain);

//     const databaseConnected = await this.storages.database.isConnected();
//     const databaseLatestPairIdStateKey = `metadata-balancer-factory-pools-${dexConfig.chain}-${dexConfig.protocol}-${dexConfig.address}`;

//     if (databaseConnected) {
//       // get existed pool from database
//       const pools: Array<any> = await this.storages.database.query({
//         collection: envConfig.mongodb.collections.metadataDexLiquidityPools.name,
//         query: {
//           chain: dexConfig.chain,
//           protocol: dexConfig.protocol,
//         },
//       });
//       for (const existedPool of pools) {
//         liquidityPools.push({
//           protocol: existedPool.protocol,
//           chain: existedPool.chain,
//           version: existedPool.version,
//           address: existedPool.address,
//           poolId: existedPool.poolId,
//           tokens: existedPool.tokens,
//           feeRate: existedPool.feeRate,
//           birthblock: existedPool.birthblock,
//           birthday: existedPool.birthday,
//         });
//       }

//       const latestSyncState = await this.storages.database.find({
//         collection: envConfig.mongodb.collections.cachingStates.name,
//         query: {
//           name: databaseLatestPairIdStateKey,
//         },
//       });
//       if (latestSyncState) {
//         startFromBlock = Number(latestSyncState.blockNumber) + 1;
//       }
//     }

//     logger.debug('start to get all balancer pools metadata', {
//       service: this.name,
//       protocol: dexConfig.protocol,
//       chain: dexConfig.chain,
//       factory: dexConfig.chain,
//       fromBlock: startFromBlock,
//       toBlock: latestBlock,
//     });

//     const chunkSize = 5000;
//     while (startFromBlock > latestBlock) {
//       const toBlock = startFromBlock + chunkSize > latestBlock ? latestBlock : startFromBlock + chunkSize;
//       const logs = await this.services.blockchain.getContractLogs({
//         chain: dexConfig.chain,
//         address: dexConfig.address,
//         fromBlock: startFromBlock,
//         toBlock: toBlock,
//       });

//       for (const log of logs) {
//         if (log.topics[0] === BalancerEventSignatures.PoolRegistered) {
//           const block = await this.services.blockchain.getBlock(dexConfig.chain, log.blockNumber);
//           const event: any = decodeEventLog({
//             abi: BalancerVaultAbi,
//             topics: log.topics,
//             data: log.data,
//           });

//           const [[tokenAddresses, ,], poolFeeRate] = await this.services.blockchain.multicall({
//             chain: dexConfig.chain,
//             blockNumber: Number(log.blockNumber),
//             calls: [
//               {
//                 abi: BalancerVaultAbi,
//                 target: dexConfig.address,
//                 method: 'getPoolTokens',
//                 params: [event.args.poolId],
//               },
//               {
//                 abi: BalancerPoolAbi,
//                 target: event.args.poolAddress,
//                 method: 'getSwapFeePercentage',
//                 params: [],
//               },
//             ],
//           });

//           if (tokenAddresses && tokenAddresses.length > 0 && poolFeeRate) {
//             const tokens: Array<Token> = [];
//             for (const tokenAddress of tokenAddresses) {
//               const token = await this.services.blockchain.getTokenInfo({
//                 chain: dexConfig.chain,
//                 address: tokenAddress,
//               });
//               if (token) {
//                 tokens.push(token);
//               } else {
//                 logger.error('failed to get token in balancer pool', {
//                   service: this.name,
//                   poolId: event.args.poolId,
//                   poolAddress: event.args.poolAddress,
//                   tokenAddress: tokenAddress,
//                 });
//                 process.exit(1);
//               }
//             }

//             if (tokens.length > 0) {
//               const liquidityPool: DexLiquidityPoolMetadata = {
//                 chain: dexConfig.chain,
//                 protocol: dexConfig.protocol,
//                 version: dexConfig.version,
//                 address: normalizeAddress(event.args.poolAddress),
//                 poolId: normalizeAddress(event.args.poolId),
//                 birthblock: Number(log.blockNumber),
//                 birthday: Number(block.timestamp),
//                 feeRate: formatBigNumberToString(poolFeeRate, 18),
//                 tokens: tokens,
//               };

//               if (databaseConnected) {
//                 await this.storages.database.update({
//                   collection: envConfig.mongodb.collections.metadataDexLiquidityPools.name,
//                   keys: {
//                     protocol: liquidityPool.protocol,
//                     chain: liquidityPool.chain,
//                     address: liquidityPool.address,
//                     poolId: liquidityPool.poolId,
//                   },
//                   updates: {
//                     ...liquidityPool,
//                   },
//                   upsert: true,
//                 });
//               }

//               liquidityPools.push(liquidityPool);
//             }
//           }
//         }
//       }

//       // update latest block number which indexed logs
//       if (databaseConnected) {
//         await this.storages.database.update({
//           collection: envConfig.mongodb.collections.cachingStates.name,
//           keys: {
//             name: databaseLatestPairIdStateKey,
//           },
//           updates: {
//             name: databaseLatestPairIdStateKey,
//             blockNumber: toBlock + 1,
//           },
//           upsert: true,
//         });
//       }

//       startFromBlock = toBlock + 1;
//     }

//     return liquidityPools;
//   }

//   public async getDexDataTimeframe(
//     options: GetAdapterDataTimeframeOptions,
//   ): Promise<Array<DexLiquidityPoolDataTimeframe> | null> {
//     const dexConfig = options.config as DexConfig;

//     const liquidityPoolMetadata: Array<DexLiquidityPoolMetadata> = await this.getDexLiquidityPoolMetadata(dexConfig);

//     const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(dexConfig.chain, options.fromTime);
//     const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(dexConfig.chain, options.toTime);
//     const stateBlock = options.latestState ? endBlock : beginBlock;
//     // const stateTime = options.latestState ? options.toTime : options.fromTime;

//     for (const liquidityPool of liquidityPoolMetadata) {
//       if (liquidityPool.birthblock > stateBlock) {
//         // pool has not existed yet
//         continue;
//       }

//       const getPoolTokens = await this.services.blockchain.readContract({
//         chain: dexConfig.chain,
//         abi: BalancerVaultAbi,
//         target: dexConfig.address,
//         method: 'getPoolTokens',
//         params: [liquidityPool.poolId],
//         blockNumber: stateBlock,
//       });

//       if (getPoolTokens) {
//         const balances = getPoolTokens[1] as Array<string>;
//         for (let i = 0; i < liquidityPool.tokens.length; i++) {
//           if ((TokenDexBase as any)[liquidityPool.chain].includes(liquidityPool.tokens[i].address)) {
//             const tokenPrice =
//           }
//         }
//       }
//     }

//     console.log(liquidityPoolMetadata);

//     return [];
//   }
// }
