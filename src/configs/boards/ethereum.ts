import { ChainNames } from '../names';

export interface EthereumLayer2Config {
  type: 'opstack' | 'arbitrum';
  chain: string;
  bridgeAddress: string;

  // https://docs.optimism.io/stack/protocol/outages#about-the-optimismportal
  portalAddress?: string;
}

export interface EthereumEcosystemConfig {
  chain: string;

  beaconDepositContract: string;

  beaconDepositDeployed: number;
  londonUpgradeBlock: number;
  parisUpgradeBlock: number;
  shanghaiUpgradeBlock: number;

  birthday: number;

  layer2: Array<EthereumLayer2Config>;
}

export const EthereumEcosystemConfigs: EthereumEcosystemConfig = {
  chain: ChainNames.ethereum,

  beaconDepositContract: '0x00000000219ab540356cbb839cbe05303d7705fa',

  // Beacon Deposit contract was deployed
  beaconDepositDeployed: 11052985, // Oct-14-2020 09:22:52 AM +UTC

  // enable EIP-1559
  londonUpgradeBlock: 12965000, // Aug-05-2021 12:33:42 PM +UTC

  // Ethereum's Paris Network Upgrade (a.k.a. the Merge!)
  parisUpgradeBlock: 15537394, // Sep-15-2022 06:42:59 AM +UTC

  // withdrawal enable
  // https://beaconcha.in/epoch/194048
  // https://beaconcha.in/slot/6209538
  shanghaiUpgradeBlock: 17034871, // Apr-12-2023 10:28:23 PM +UTC

  birthday: 1712880000, // Fri Apr 12 2024 00:00:00 GMT+0000

  layer2: [
    {
      type: 'opstack',
      chain: ChainNames.optimism,
      bridgeAddress: '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1',
      portalAddress: '0xbeb5fc579115071764c7423a4f12edde41f106ed',
    },
    {
      type: 'opstack',
      chain: ChainNames.base,
      bridgeAddress: '0x3154cf16ccdb4c6d922629664174b904d80f2c35',
      portalAddress: '0x49048044d57e1c92a77f79988d21fa8faf74e97e',
    },
  ],
};
