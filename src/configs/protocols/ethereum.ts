import assert from 'node:assert';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { EthereumBeaconDepositContract } from '../constants';
import envConfig from '../envConfig';
import { ChainNames, ProtocolNames } from '../names';
import { normalizeAddress } from '../../lib/utils';

export type Layer2Based = 'optimism' | 'arbitrum' | 'taiko' | 'linea' | 'scroll' | 'polygonzkevm' | 'zksync';

export interface Layer2Config {
  layer2: string;
  based: Layer2Based;

  bridgeConfig: {
    contractHoldEth: string;
  };
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

  // beacon api
  beaconNode: string;

  // list of layer 2 configs
  layer2: Array<Layer2Config>;

  // list of liquid staking protocol
  // which stake ETH into eth2
  liquidStaking: Array<LiquidStakingConfig>;
}

export interface EthereumProtocolConfig extends ProtocolConfig {
  configs: Array<EthereumEcosystemConfig>;
}

const AllLayer2: Array<string> = [
  // chain:based:contractHoldEth
  'arbitrum:arbitrum:0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a', // bridge
  'taiko:taiko:0xd60247c6848b7ca29eddf63aa924e53db6ddd8ec',
  'linea:linea:0xd19d4b5d358258f05d7b411e21a1460d11b0876f',
  'optimism:optimism:0xbeb5fc579115071764c7423a4f12edde41f106ed', // portal
  'base:optimism:0x49048044d57e1c92a77f79988d21fa8faf74e97e',
  'mode:optimism:0x8b34b14c7c7123459cf3076b8cb929be097d0c07',
  'fraxtal:optimism:0x36cb65c1967a0fb0eee11569c51c2f2aa1ca6f6d',
  'zora:optimism:0x1a0ad011913a150f69f6a19df447a0cfd9551054',
  'cyber:optimism:0x1d59bc9fce6b8e2b1bf86d4777289ffd83d24c99',
  'redstone:optimism:0xc7bcb0e8839a28a1cfadd1cf716de9016cda51ae',
  'mint:optimism:0x59625d1fe0eeb8114a4d13c863978f39b3471781',
  'blast:optimism:0x98078db053902644191f93988341e31289e1c8fe', // yield manager
  'bob:optimism:0x8adee124447435fe03e3cd24df3f4cae32e65a3e', // portal
  'aevo:optimism:0x787a0acab02437c60aafb1a29167a3609801e320', // portal
  'lyra:optimism:0x85ea9c11cf3d4786027f7fd08f4406b15777e5f8', // portal
  'scroll:scroll:0x6774bcbd5cecef1336b5300fb5186a12ddd8b367', // messager
  'polygonzkevm:polygonzkevm:0x2a3dd3eb832af982ec71669e178424b10dca2ede', // bridge
  'zksync:zksync:0xd7f9f54194c633f36ccd5f3da84ad4a1c38cb2cb', // asset holder
  'kroma:optimism:0x31F648572b67e60Ec6eb8E197E1848CC5F5558de', // portal
  'ancient8:optimism:0x639f2aece398aa76b07e59ef6abe2cfe32bacb68', // portal
  'lisk:optimism:0x26db93f8b8b4f7016240af62f7730979d353f9a7', // portal
  'mantle:optimism:0xc54cb22944f2be476e02decfcd7e3e7d3e15a8fb', // portal
];

export const EthereumConfigs: EthereumProtocolConfig = {
  protocol: ProtocolNames.ethereum,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.ethereum,
      metric: DataMetrics.ecosystem,
      birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
      address: EthereumBeaconDepositContract,

      // to get Ether supply info
      etherscanApiKey: envConfig.externalConfigs.etherscanApiKey,

      // to get beacon CL data
      beaconNode: envConfig.externalConfigs.beaconNode,

      // layer 2 configs
      layer2: AllLayer2.map((item) => {
        const [chain, based, address] = item.split(':');

        assert((ChainNames as any)[chain] !== undefined);

        return {
          layer2: (ChainNames as any)[chain],
          based: based as Layer2Based,
          bridgeConfig: {
            contractHoldEth: normalizeAddress(address),
          },
        };
      }),

      // liquid staking configs
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
        {
          protocol: ProtocolNames.liquidcollective,
          contracts: {
            lsETH: {
              chain: ChainNames.ethereum,
              address: '0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549',
            },
          },
        },
        {
          protocol: ProtocolNames.originether,
          contracts: {
            OETHVault: {
              chain: ChainNames.ethereum,
              address: '0x39254033945aa2e4809cc2977e7087bee48bd7ab',
            },
          },
        },
        {
          protocol: ProtocolNames.ankr,
          contracts: {
            ankrETH: {
              chain: ChainNames.ethereum,
              address: '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb',
            },
          },
        },
        {
          protocol: ProtocolNames.cryptocomStakedEth,
          contracts: {
            CDCETH: {
              chain: ChainNames.cronos,
              address: '0x7a7c9db510ab29a2fc362a4c34260becb5ce3446',
            },
          },
        },
      ],
    },
  ],
};
