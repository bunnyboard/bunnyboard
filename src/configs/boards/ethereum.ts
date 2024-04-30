export interface EthereumEcosystemConfig {
  beaconDepositContract: string;
  londonUpgradeBlock: number;
  parisUpgradeBlock: number;
  shanghaiUpgradeBlock: number;
}

export const EthereumEcosystemConfigs: EthereumEcosystemConfig = {
  beaconDepositContract: '0x00000000219ab540356cbb839cbe05303d7705fa',

  // enable EIP-1559
  londonUpgradeBlock: 12965000, // Aug-05-2021 12:33:42 PM +UTC

  // Ethereum's Paris Network Upgrade (a.k.a. the Merge!)
  parisUpgradeBlock: 15537394, // Sep-15-2022 06:42:59 AM +UTC

  // withdrawal enable
  // https://beaconcha.in/epoch/194048
  // https://beaconcha.in/slot/6209538
  shanghaiUpgradeBlock: 17034871, // Apr-12-2023 10:28:23 PM +UTC
};
