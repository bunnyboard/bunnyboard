import BigNumber from 'bignumber.js';

import Erc4626Abi from '../../configs/abi/ERC4626.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';

interface GetVaultPriceOptions {
  chain: string;
  address: string;
  decimals: number;
  blockNumber: number;
}

export default class Erc4626Libs {
  public static async getVaultPrice(options: GetVaultPriceOptions): Promise<string | null> {
    const { chain, address, decimals, blockNumber } = options;

    const blockchain = new BlockchainService();
    const vaultPrice = await blockchain.readContract({
      chain: chain,
      abi: Erc4626Abi,
      target: address,
      method: 'convertToAssets',
      params: [new BigNumber(10).pow(decimals).toString(10)],
      blockNumber: blockNumber,
    });

    return formatBigNumberToString(vaultPrice ? vaultPrice.toString() : '0', decimals);
  }
}
