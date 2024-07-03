import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { LiquityEventSignatures } from '../liquity/abis';
import LiquityAdapter from '../liquity/liquity';
import LiquityBorrowOperationsAbi from '../../../configs/abi/liquity/BorrowOperations.json';

export default class OrbynetworkAdapter extends LiquityAdapter {
  public readonly name: string = 'adapter.orbynetwork';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = {
      ...LiquityEventSignatures,

      // override event signature
      LUSDBorrowingFeePaid: '0x34cbe22bcccdac873dfdbcf9813211648316e94ccd3270ee28a1cb172312f8b2',
    };
    this.abiConfigs.eventAbis = {
      borrowOperation: [
        ...LiquityBorrowOperationsAbi,

        // custom fee paid event from orby
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: '_borrower',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: '_LUSDFee', // NOTE: liquity adapter read this field
              type: 'uint256',
            },
          ],
          name: 'USCBorrowingFeePaid',
          type: 'event',
        },
      ],
      troveManager: TroveManagerAbi,
    };
  }
}
