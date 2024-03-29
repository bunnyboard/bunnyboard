import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundAdapter from '../compound/compound';
import { VenusEventSignatures } from './abis';

export default class VenusAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.venus';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = VenusEventSignatures;
    this.abiConfigs.eventAbis = {
      cErc20: cErc20Abi,
      comptroller: [
        ...CompoundComptrollerAbi,
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'contract CToken',
              name: 'cToken',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'borrower',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'compDelta',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'compBorrowIndex',
              type: 'uint256',
            },
          ],
          name: 'DistributedBorrowerVenus',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'contract CToken',
              name: 'cToken',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'supplier',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'compDelta',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'compSupplyIndex',
              type: 'uint256',
            },
          ],
          name: 'DistributedSupplierVenus',
          type: 'event',
        },
      ],
    };
  }
}
