export interface SushiMasterchefEventInterfaces {
  Deposit: string;
  Withdraw: string;
  EmergencyWithdraw: string;
}

export const SushiMasterchefEventSignatures: SushiMasterchefEventInterfaces = {
  Deposit: '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15',
  Withdraw: '0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568',
  EmergencyWithdraw: '0xbb757047c2b5f3974fe26b7c10f732e7bce710b0952a71082702781e62ae0595',
};

export const SushiMasterchefEventAbiMappings: { [key: string]: Array<any> } = {
  [SushiMasterchefEventSignatures.Deposit]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'uint256',
      name: 'pid',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
  ],
  [SushiMasterchefEventSignatures.Withdraw]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'uint256',
      name: 'pid',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
  ],
  [SushiMasterchefEventSignatures.EmergencyWithdraw]: [
    {
      indexed: true,
      internalType: 'address',
      name: 'user',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'uint256',
      name: 'pid',
      type: 'uint256',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
  ],
};
