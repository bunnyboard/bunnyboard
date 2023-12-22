import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import { ProtocolConfigs } from '../../../configs';
import VenusComptrollerAbi from '../../../configs/abi/venus/venusUnitroller.json';
import { CompoundProtocolConfig } from '../../../configs/protocols/compound';
import { formatFromDecimals, normalizeAddress } from '../../../lib/utils';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { LendingActivityEvent } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { CompoundEventInterfaces } from '../compound/abis';
import CompoundAdapter from '../compound/compound';
import { VenusCoreEventAbiMappings, VenusCoreEventSignatures } from './abis';

export default class VenusAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.venus';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = VenusCoreEventSignatures;
    this.abiConfigs.eventAbiMappings = VenusCoreEventAbiMappings;
  }

  protected async parseEventLogDistributeReward(
    config: LendingMarketConfig,
    log: any,
  ): Promise<LendingActivityEvent | null> {
    const protocolConfig = this.config as CompoundProtocolConfig;
    if (protocolConfig.comptrollers && protocolConfig.comptrollers[config.chain]) {
      const signature = log.topics[0];
      const eventSignatures = this.abiConfigs.eventSignatures as CompoundEventInterfaces;
      if (
        signature === eventSignatures.DistributedSupplierRewards ||
        signature === eventSignatures.DistributedBorrowerRewards
      ) {
        const event: any = decodeEventLog({
          abi: VenusComptrollerAbi,
          data: log.data,
          topics: log.topics,
        });
        const amount = formatFromDecimals(
          event.args.compDelta.toString(),
          protocolConfig.comptrollers[config.chain].governanceToken.decimals,
        );
        const user = event.args.supplier
          ? normalizeAddress(event.args.supplier)
          : normalizeAddress(event.args.borrower);

        if (amount !== '0') {
          return {
            chain: config.chain,
            protocol: this.config.protocol,
            address: config.address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            action: 'collect',
            user: user,
            token: protocolConfig.comptrollers[config.chain].governanceToken,
            tokenAmount: amount,
          };
        }
      }
    }

    return null;
  }

  protected async getMarketRewardsSpeed(
    config: LendingMarketConfig,
    blockNumber: number,
  ): Promise<{
    supplySpeed: string;
    borrowSpeed: string;
  } | null> {
    // compound rewards were calculated based on supply and borrow speeds
    const comptroller = ProtocolConfigs[config.protocol]
      ? (ProtocolConfigs[config.protocol] as CompoundProtocolConfig).comptrollers[config.chain]
      : null;
    if (comptroller) {
      const supplySpeed = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: [
          {
            constant: true,
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'venusSupplySpeeds',
            outputs: [
              {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
              },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ],
        target: comptroller.address,
        method: 'venusSupplySpeeds',
        params: [config.address],
        blockNumber: blockNumber,
      });
      const borrowSpeed = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: [
          {
            constant: true,
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'venusBorrowSpeeds',
            outputs: [
              {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
              },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ],
        target: comptroller.address,
        method: 'venusBorrowSpeeds',
        params: [config.address],
        blockNumber: blockNumber,
      });

      if (supplySpeed && borrowSpeed) {
        return {
          supplySpeed: supplySpeed.toString(),
          borrowSpeed: borrowSpeed.toString(),
        };
      }
    }

    return null;
  }
}
