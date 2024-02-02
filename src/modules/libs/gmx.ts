import VaultAbi from '../../configs/abi/gmx/Vault.json';
import BlockchainService from '../../services/blockchains/blockchain';
import { Token } from '../../types/configs';

export interface GmxVaultInfo {
  chain: string;
  address: string;
  // all whitelisted tokens
  tokens: Array<Token>;
}

export default class GmxLibs {
  public static async getVaultInfo(chain: string, address: string): Promise<GmxVaultInfo> {
    const blockchain = new BlockchainService();
    const vault: GmxVaultInfo = {
      chain: chain,
      address: address,
      tokens: [],
    };

    const tokenLength = await blockchain.readContract({
      chain: chain,
      abi: VaultAbi,
      target: address,
      method: 'allWhitelistedTokensLength',
      params: [],
    });
    for (let i = 0; i < Number(tokenLength); i++) {
      const tokenAddress = await blockchain.readContract({
        chain: chain,
        abi: VaultAbi,
        target: address,
        method: 'allWhitelistedTokens',
        params: [i],
      });
      const token = await blockchain.getTokenInfo({
        chain: chain,
        address: tokenAddress,
      });
      if (token) {
        vault.tokens.push(token);
      }
    }

    return vault;
  }
}
