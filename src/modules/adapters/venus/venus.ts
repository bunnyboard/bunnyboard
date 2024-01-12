import VenusComptrollerAbi from '../../../configs/abi/venus/VenusComptoller.json';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { formatBigNumberToString } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import CompoundAdapter from '../compound/compound';

interface Speeds {
  supplySpeed: string;
  borrowSpeed: string;
}

export default class VenusAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.venus';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
  }

  protected async getMarketCompSpeeds(
    config: CompoundLendingMarketConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<Speeds | null> {
    const venusSpeeds = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: VenusComptrollerAbi,
      target: config.address,
      method: 'venusSpeeds',
      params: [cTokenContract],
      blockNumber,
    });
    if (venusSpeeds) {
      return {
        supplySpeed: formatBigNumberToString(venusSpeeds.toString(), 18),
        borrowSpeed: formatBigNumberToString(venusSpeeds.toString(), 18),
      };
    }

    const venusSupplySpeeds = await this.services.blockchain.readContract({
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
      target: config.address,
      method: 'venusSupplySpeeds',
      params: [cTokenContract],
      blockNumber,
    });
    const venusBorrowSpeeds = await this.services.blockchain.readContract({
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
      target: config.address,
      method: 'venusBorrowSpeeds',
      params: [cTokenContract],
      blockNumber,
    });

    if (venusSupplySpeeds && venusBorrowSpeeds) {
      return {
        supplySpeed: formatBigNumberToString(venusSupplySpeeds.toString(), 18),
        borrowSpeed: formatBigNumberToString(venusBorrowSpeeds.toString(), 18),
      };
    } else {
      return null;
    }
  }
}
