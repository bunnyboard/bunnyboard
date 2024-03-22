// import ReaderV2Abi from '../../configs/abi/gmx/ReaderV2.json';
// import VaultAbi from '../../configs/abi/gmx/Vault.json';
// import { Gmxv2PerpetualMarketConfig } from '../../configs/protocols/gmx';
// import { compareAddress } from '../../lib/utils';
// import BlockchainService from '../../services/blockchains/blockchain';
// import { Token } from '../../types/configs';
//
// export interface GmxVaultInfo {
//   chain: string;
//   address: string;
//   // all whitelisted tokens
//   tokens: Array<Token>;
// }
//
// export interface Gmxv2GmPool {
//   chain: string;
//   protocol: string;
//   marketToken: Token; // GM LP token
//   indexToken: Token;
//   longToken: Token;
//   shortToken: Token;
// }
//
// export default class GmxLibs {
//   public static async getVaultInfo(chain: string, address: string): Promise<GmxVaultInfo> {
//     const blockchain = new BlockchainService();
//     const vault: GmxVaultInfo = {
//       chain: chain,
//       address: address,
//       tokens: [],
//     };
//
//     const tokenLength = await blockchain.readContract({
//       chain: chain,
//       abi: VaultAbi,
//       target: address,
//       method: 'allWhitelistedTokensLength',
//       params: [],
//     });
//     for (let i = 0; i < Number(tokenLength); i++) {
//       const tokenAddress = await blockchain.readContract({
//         chain: chain,
//         abi: VaultAbi,
//         target: address,
//         method: 'allWhitelistedTokens',
//         params: [i],
//       });
//       const token = await blockchain.getTokenInfo({
//         chain: chain,
//         address: tokenAddress,
//       });
//       if (token) {
//         vault.tokens.push(token);
//       }
//     }
//
//     return vault;
//   }
//
//   public static async getMarketListV2(config: Gmxv2PerpetualMarketConfig): Promise<Array<Gmxv2GmPool>> {
//     const pools: Array<Gmxv2GmPool> = [];
//
//     const blockchain = new BlockchainService();
//     const markets = await blockchain.readContract({
//       chain: config.chain,
//       abi: ReaderV2Abi,
//       target: config.reader,
//       method: 'getMarkets',
//       params: [config.dataStore, 0, 1000000],
//     });
//
//     for (const market of markets) {
//       const marketToken = await blockchain.getTokenInfo({ chain: config.chain, address: market.marketToken });
//       const indexToken = await blockchain.getTokenInfo({ chain: config.chain, address: market.indexToken });
//       const longToken = await blockchain.getTokenInfo({ chain: config.chain, address: market.longToken });
//       const shortToken = await blockchain.getTokenInfo({ chain: config.chain, address: market.shortToken });
//       if (marketToken && indexToken && longToken && shortToken) {
//         pools.push({
//           chain: config.chain,
//           protocol: config.protocol,
//           marketToken: {
//             ...marketToken,
//             symbol: `${indexToken.symbol}-${marketToken.symbol}`,
//           },
//           indexToken: indexToken,
//           longToken: longToken,
//           shortToken: shortToken,
//         });
//       } else if (marketToken && longToken && shortToken) {
//         const mockIndexToken = config.mockTokens.filter((item) => compareAddress(item.address, market.indexToken))[0];
//         if (mockIndexToken) {
//           pools.push({
//             chain: config.chain,
//             protocol: config.protocol,
//             marketToken: {
//               ...marketToken,
//               symbol: `${mockIndexToken.symbol}-${marketToken.symbol}`,
//             },
//             indexToken: mockIndexToken,
//             longToken: longToken,
//             shortToken: shortToken,
//           });
//         }
//       } else {
//       }
//     }
//
//     return pools;
//   }
// }
