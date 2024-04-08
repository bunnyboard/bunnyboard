// import BigNumber from 'bignumber.js';
// import { decodeEventLog } from 'viem';
//
// import BorrowOperationsAbi from '../../../configs/abi/liquity/BorrowOperations.json';
// import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
// import { LiquityLendingMarketConfig, LiquityTrove } from '../../../configs/protocols/liquity';
// import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
// import { ActivityAction, ActivityActions } from '../../../types/base';
// import { ProtocolConfig, Token } from '../../../types/configs';
// import {
//   CdpLendingActivityEvent,
//   CdpLendingAssetDataState,
//   CdpLendingAssetDataTimeframe,
// } from '../../../types/domains/cdpLending';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import {
//   GetAdapterDataStateOptions,
//   GetAdapterDataTimeframeOptions,
//   TransformEventLogOptions,
//   TransformEventLogResult,
// } from '../../../types/options';
// import { AdapterGetEventLogsOptions } from '../adapter';
// import CdpLendingProtocolAdapter from '../cdpLending';
// import { LiquityEventInterfaces, LiquityEventSignatures } from './abis';
// import { AbracadabraMarketConfig } from '../../../configs/protocols/abracadabra';
// import CauldronV4Abi from '../../../configs/abi/abracadabra/CauldronV4.json';
// import PeekOracleAbi from '../../../configs/abi/abracadabra/PeekOracle.json';
//
// export default class AbracadabraAdapter extends CdpLendingProtocolAdapter {
//   public readonly name: string = 'adapter.abracadabra';
//
//   constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
//     super(services, storages, protocolConfig);
//   }
//
//   public async getLendingAssetDataState(options: GetAdapterDataStateOptions): Promise<CdpLendingAssetDataState | null> {
//     const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
//       options.config.chain,
//       options.timestamp,
//     );
//
//     const marketConfig: AbracadabraMarketConfig = options.config as AbracadabraMarketConfig;
//     const debtToken = marketConfig.debtToken as Token;
//     const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
//       chain: debtToken.chain,
//       address: debtToken.address,
//       timestamp: options.timestamp,
//     });
//
//     if (!debtTokenPrice) {
//       return null;
//     }
//
//     const assetState: CdpLendingAssetDataState = {
//       chain: options.config.chain,
//       protocol: options.config.protocol,
//       metric: options.config.metric,
//       timestamp: options.timestamp,
//       token: debtToken,
//       tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
//       totalBorrowed: '0',
//       collaterals: [],
//     };
//
//     // we do get collateral token price here
//     const [oracle, oracleData] = await this.services.blockchain.multicall({
//       chain: marketConfig.chain,
//       blockNumber: blockNumber,
//       calls: [
//         {
//           target: marketConfig.address,
//           abi: CauldronV4Abi,
//           method: 'oracle',
//           params: [],
//         },
//         {
//           target: marketConfig.address,
//           abi: CauldronV4Abi,
//           method: 'oracleData',
//           params: [],
//         },
//       ],
//     })
//     if (oracle && oracleData) {
//       const peekRate = await this.services.blockchain.readContract({
//         chain: marketConfig.chain,
//         target: oracle.toString(),
//         abi: PeekOracleAbi,
//         method: 'peek',
//         params: [oracleData],
//         blockNumber: blockNumber,
//       });
//       const collateralTokenPrice = new BigNumber(debtTokenPrice)
//         .dividedBy(new BigNumber(formatBigNumberToString(peekRate.toString(), marketConfig.collateralToken.decimals)))
//         .toString(10);
//
//
//     }
//
//     for (const trove of marketConfig.troves) {
//       const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
//         chain: trove.collateralToken.chain,
//         address: trove.collateralToken.address,
//         timestamp: options.timestamp,
//       });
//
//       const totalDebt = await this.services.blockchain.readContract({
//         chain: marketConfig.chain,
//         abi: this.abiConfigs.eventAbis.troveManager,
//         target: marketConfig.address,
//         method: 'getEntireSystemDebt',
//         params: [],
//         blockNumber: blockNumber,
//       });
//       assetState.totalBorrowed = new BigNumber(assetState.totalBorrowed)
//         .plus(formatBigNumberToString(totalDebt.toString(), debtToken.decimals))
//         .toString(10);
//
//       const totalColl = await this.services.blockchain.readContract({
//         chain: marketConfig.chain,
//         abi: this.abiConfigs.eventAbis.troveManager,
//         target: marketConfig.address,
//         method: 'getEntireSystemColl',
//         params: [],
//         blockNumber: blockNumber,
//       });
//
//       const borrowingFee = await this.getBorrowingFee(marketConfig.chain, trove.troveManager, blockNumber);
//
//       assetState.collaterals.push({
//         chain: options.config.chain,
//         protocol: options.config.protocol,
//         metric: options.config.metric,
//         timestamp: options.timestamp,
//         address: trove.troveManager,
//         token: trove.collateralToken,
//         tokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',
//         totalBorrowed: formatBigNumberToString(totalDebt.toString(), debtToken.decimals),
//         totalDeposited: formatBigNumberToString(totalColl.toString(), trove.collateralToken.decimals),
//         rateBorrow: '0',
//
//         // liquity charged on-time paid fee
//         rateBorrowFee: formatBigNumberToString(borrowingFee, 18),
//
//         // liquity must maintain 110% collateral value on debts
//         // so, the loan to value is always 100 / 110 -> 0.9 -> 90%
//         rateLoanToValue: '0.9',
//       });
//     }
//
//     return assetState;
//   }
// }
