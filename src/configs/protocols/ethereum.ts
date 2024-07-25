import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { EthereumBeaconDepositContract } from '../constants';
import envConfig from '../envConfig';
import { ChainNames, ProtocolNames } from '../names';

export interface OptimismBridgeConfig {
  portal: string;
  gateways: Array<string>;
}

export interface ArbitrumBridgeConfig {
  bridge: string;
  inbox: string;
}

export interface Layer2Config {
  layer2: string; // chain name
  based: 'optimism' | 'arbitrum';

  bridgeConfig: OptimismBridgeConfig | ArbitrumBridgeConfig;
}

export interface LiquidStakingConfig {
  protocol: string;
  contracts: {
    [key: string]: {
      chain: string;
      address: string;
    };
  };
}

export interface EthereumEcosystemConfig extends MetricConfig {
  // should be the staking contract
  address: string;

  // etherscan api key
  etherscanApiKey: string;

  // list of layer 2 configs
  layer2: Array<Layer2Config>;

  // list of liquid staking protocol
  // which stake ETH into eth2
  liquidStaking: Array<LiquidStakingConfig>;
}

export interface EthereumProtocolConfig extends ProtocolConfig {
  configs: Array<EthereumEcosystemConfig>;
}

export const EthereumConfigs: EthereumProtocolConfig = {
  protocol: ProtocolNames.ethereum,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.ethereum,
      metric: DataMetrics.ecosystem,
      birthday: 1602720000, // Thu Oct 15 2020 00:00:00 GMT+0000
      address: EthereumBeaconDepositContract,
      etherscanApiKey: envConfig.apiKeys.etherscan,
      layer2: [
        {
          layer2: ChainNames.arbitrum,
          based: 'arbitrum',
          bridgeConfig: {
            bridge: '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a',
            inbox: '0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f',
          },
        },
        {
          layer2: ChainNames.optimism,
          based: 'optimism',
          bridgeConfig: {
            portal: '0xbeb5fc579115071764c7423a4f12edde41f106ed',
            gateways: ['0x99c9fc46f92e8a1c0dec1b1747d010903e884be1'],
          },
        },
        {
          layer2: ChainNames.base,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x49048044d57e1c92a77f79988d21fa8faf74e97e',
            gateways: ['0x3154cf16ccdb4c6d922629664174b904d80f2c35'],
          },
        },
        {
          layer2: ChainNames.mode,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x8b34b14c7c7123459cf3076b8cb929be097d0c07',
            gateways: ['0x735adbbe72226bd52e818e7181953f42e3b0ff21'],
          },
        },
        {
          layer2: ChainNames.fraxtal,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x36cb65c1967a0fb0eee11569c51c2f2aa1ca6f6d',
            gateways: ['0x34c0bd5877a5ee7099d0f5688d65f4bb9158bde2'],
          },
        },
        {
          layer2: ChainNames.zora,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x1a0ad011913a150f69f6a19df447a0cfd9551054',
            gateways: ['0x3e2ea9b92b7e48a52296fd261dc26fd995284631'],
          },
        },
        {
          layer2: ChainNames.cyber,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x1d59bc9fce6b8e2b1bf86d4777289ffd83d24c99',
            gateways: ['0x12a580c05466eefb2c467c6b115844cdaf55b255'],
          },
        },
        {
          layer2: ChainNames.redstone,
          based: 'optimism',
          bridgeConfig: {
            portal: '0xc7bcb0e8839a28a1cfadd1cf716de9016cda51ae',
            gateways: ['0xc473ca7e02af24c129c2eef51f2adf0411c1df69'],
          },
        },
        {
          layer2: ChainNames.mint,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x59625d1fe0eeb8114a4d13c863978f39b3471781',
            gateways: ['0x2b3f201543adf73160ba42e1a5b7750024f30420'],
          },
        },
        {
          layer2: ChainNames.blast,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x98078db053902644191f93988341e31289e1c8fe', // yield manager
            gateways: ['0x3a05e5d33d7ab3864d53aaec93c8301c1fa49115', '0x697402166fbf2f22e970df8a6486ef171dbfc524'],
          },
        },
        {
          layer2: ChainNames.bob,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x8adee124447435fe03e3cd24df3f4cae32e65a3e',
            gateways: ['0x3f6ce1b36e5120bbc59d0cfe8a5ac8b6464ac1f7'],
          },
        },
        {
          layer2: ChainNames.aevo,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x787a0acab02437c60aafb1a29167a3609801e320',
            gateways: ['0x4082c9647c098a6493fb499eae63b5ce3259c574'],
          },
        },
        {
          layer2: ChainNames.lyra,
          based: 'optimism',
          bridgeConfig: {
            portal: '0x85ea9c11cf3d4786027f7fd08f4406b15777e5f8',
            gateways: ['0x61e44dc0dae6888b5a301887732217d5725b0bff'],
          },
        },
      ],
      liquidStaking: [
        {
          protocol: ProtocolNames.lido,
          contracts: {
            stETH: {
              chain: ChainNames.ethereum,
              address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
            },
          },
        },
        {
          protocol: ProtocolNames.rocketpool,
          contracts: {
            rETH: {
              chain: ChainNames.ethereum,
              address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
            },
            miniPoolManager: {
              chain: ChainNames.ethereum,
              address: '0x6293B8abC1F36aFB22406Be5f96D893072A8cF3a',
            },
          },
        },
        {
          protocol: ProtocolNames.binanceStakedEth,
          contracts: {
            wBETHEthereum: {
              chain: ChainNames.ethereum,
              address: '0xa2e3356610840701bdf5611a53974510ae27e2e1',
            },
            wBETHBnbChain: {
              chain: ChainNames.bnbchain,
              address: '0xa2e3356610840701bdf5611a53974510ae27e2e1',
            },
          },
        },
        {
          protocol: ProtocolNames.mantleStakedEth,
          contracts: {
            stakingContract: {
              chain: ChainNames.ethereum,
              address: '0xe3cbd06d7dadb3f4e6557bab7edd924cd1489e8f',
            },
          },
        },
        {
          protocol: ProtocolNames.coinbaseStakedEth,
          contracts: {},
        },
        {
          protocol: ProtocolNames.fraxether,
          contracts: {
            frxETH: {
              chain: ChainNames.ethereum,
              address: '0x5e8422345238f34275888049021821e8e08caa1f',
            },
          },
        },
        {
          protocol: ProtocolNames.swellnetwork,
          contracts: {
            swETH: {
              chain: ChainNames.ethereum,
              address: '0xf951e335afb289353dc249e82926178eac7ded78',
            },
          },
        },
        {
          protocol: ProtocolNames.stakestone,
          contracts: {
            assetValut: {
              chain: ChainNames.ethereum,
              address: '0x9485711f11B17f73f2CCc8561bcae05BDc7E9ad9',
            },
            strategyManager: {
              chain: ChainNames.ethereum,
              address: '0x396aBF9fF46E21694F4eF01ca77C6d7893A017B2',
            },
          },
        },
        {
          protocol: ProtocolNames.stader,
          contracts: {
            stakingPoolManager: {
              chain: ChainNames.ethereum,
              address: '0xcf5ea1b38380f6af39068375516daf40ed70d299',
            },
            nodeRegistry: {
              chain: ChainNames.ethereum,
              address: '0x4f4bfa0861f62309934a5551e0b2541ee82fdcf1',
            },
          },
        },
      ],
    },
  ],
};
