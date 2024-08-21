import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
import { ContextServices } from '../../../types/namespaces';
import logger from '../../../lib/logger';
import { ChainNames } from '../../../configs/names';
import { formatBigNumberToString } from '../../../lib/utils';
import BlastYieldManagerAbi from '../../../configs/abi/blast/YieldManager.json';
import { Address } from 'viem';
import { EthLayer2Stats } from '../../../types/domains/ecosystem/ethereum';

export interface GetLayer2DataOptions {
  services: ContextServices;
  ethereumConfig: EthereumEcosystemConfig;
  blockNumber: number;
}

export default class Layer2Helper {
  public static async getLayer2Data(options: GetLayer2DataOptions): Promise<Array<EthLayer2Stats>> {
    const { services, ethereumConfig, blockNumber } = options;

    const stats: Array<EthLayer2Stats> = [];

    for (const layer2Config of ethereumConfig.layer2) {
      logger.debug(`getting ethereum layer 2 data`, {
        service: this.name,
        chain: ethereumConfig.chain,
        protocol: ethereumConfig.protocol,
        layer2: layer2Config.layer2,
        blockNumber: blockNumber,
      });

      try {
        const layer2Stats: EthLayer2Stats = {
          layer2: layer2Config.layer2,
          totalEthDeposited: '0',
        };

        if (layer2Config.layer2 === ChainNames.blast) {
          const balance = await services.blockchain.readContract({
            chain: ethereumConfig.chain,
            target: layer2Config.bridgeConfig.contractHoldEth,
            abi: BlastYieldManagerAbi,
            method: 'totalValue',
            params: [],
            blockNumber: blockNumber,
          });
          layer2Stats.totalEthDeposited = formatBigNumberToString(balance.toString(), 18);
        } else {
          const client = services.blockchain.getPublicClient(ethereumConfig.chain);
          const balance = await client.getBalance({
            address: layer2Config.bridgeConfig.contractHoldEth as Address,
          });
          layer2Stats.totalEthDeposited = formatBigNumberToString(balance.toString(), 18);
        }

        stats.push(layer2Stats);
      } catch (e: any) {}
    }

    return stats;
  }
}
