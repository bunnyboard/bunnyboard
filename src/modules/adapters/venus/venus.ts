import { ProtocolConfigs } from '../../../configs';
import { CompoundProtocolConfig } from '../../../configs/protocols/compound';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import CompoundAdapter from '../compound/compound';
import { VenusCoreEventAbiMappings, VenusCoreEventSignatures } from './abis';

export default class VenusAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.venus';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = VenusCoreEventSignatures;
    this.abiConfigs.eventAbiMappings = VenusCoreEventAbiMappings;
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
      const supplySpeed = await this.services.blockchain.singlecall({
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
        params: [comptroller.address],
        blockNumber: blockNumber,
      });
      const borrowSpeed = await this.services.blockchain.singlecall({
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
        params: [comptroller.address],
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
