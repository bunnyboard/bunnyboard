import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface BungeeGatewayConfig extends MetricConfig {
  blacklists?: Array<string>;
}

export interface BungeeProtocolConfig extends ProtocolConfig {
  configs: Array<BungeeGatewayConfig>;
}

export const BungeeConfigs: BungeeProtocolConfig = {
  protocol: ProtocolNames.bungee,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: ['0xfb5c6815ca3ac72ce9f5006869ae67f18bf77006'],
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: [
        '0xc3ae0333f0f34aa734d5493276223d95b8f9cb37',
        '0x2e9a6df78e42a30712c10a9dc4b1c8656f8f2879',
        '0x7cbaf5a14d953ff896e5b3312031515c858737c8',
        '0x3642c0680329ae3e103e2b5ab29ddfed4d43cbe5',
        '0x739ca6d71365a08f584c8fc4e1029045fa8abc4b',
        '0x3593d125a4f7849a1b059e64f4517a86dd60c95d',
        '0xa735a3af76cc30791c61c10d585833829d36cbe0',
        '0x163f8c2467924be0ae7b5347228cabf260318753',
        '0xd13cfd3133239a3c73a9e535a5c4dadee36b395c',
        '0x16eccfdbb4ee1a85a33f3a9b21175cd7ae753db4',
      ],
    },
    // {
    //   chain: ChainNames.aurora,
    //   protocol: ProtocolNames.bungee,
    //   metric: DataMetrics.ecosystem,
    //   birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
    //   address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    // },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: [
        '0x321e7092a180bb43555132ec53aaa65a5bf84251',
        '0x026187bdbc6b751003517bcb30ac7817d5b766f8',
        '0x4bfc90322dd638f81f034517359bd447f8e0235a',
        '0x65378b697853568da9ff8eab60c13e1ee9f4a654',
        '0xa56f9a54880afbc30cf29bb66d2d9adcdcaeadd6',
        '0xe896cdeaac9615145c0ca09c8cd5c25bced6384c',
        '0xc38f41a296a4493ff429f1238e030924a1542e50',
        '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c',
        '0x59414b3089ce2af0010e7523dea7e2b35d776ec7',
        '0xb54f16fb19478766a268f172c9480f8da1a7c9c3',
        '0x0f34919404a290e71fc6a510cb4a6acb8d764b24',
        '0xa32608e873f9ddef944b24798db69d80bbb4d1ed',
        '0x47eb6f7525c1aa999fbc9ee92715f5231eb1241d',
        '0x8ae8be25c23833e0a01aa200403e826f611f9cd2',
        '0xec3492a2508ddf4fdc0cd76f31f340b30d1793e6',
        '0xb00f1ad977a949a3ccc389ca1d1282a2946963b0',
        '0x100cc3a819dd3e8573fd2e46d1e66ee866068f30',
      ],
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1690675200, // Sun Jul 30 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: ['0x38815a4455921667d673b4cb3d48f0383ee93400'],
    },
    {
      chain: ChainNames.blast,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: ['0xcbf7b47e9da345812e3bd732e3ee369a7203b5ae'],
    },
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: [
        '0x728c5bac3c3e370e372fc4671f9ef6916b814d8b',
        '0x2090c8295769791ab7a3cf1cc6e0aa19f35e441a',
        '0xf21768ccbc73ea5b6fd3c687208a7c2def2d966e',
        '0x4da996c5fe84755c80e108cf96fe705174c5e36a',
        '0xee9801669c6138e84bd50deb500827b776777d28',
        '0xfd7b3a77848f1c2d67e05e54d78d174a0c850335',
        '0x1ba42e5193dfa8b03d15dd1b86a3113bbbef8eeb',
        '0xae9269f27437f0fcbc232d39ec814844a51d6b8f',
        '0xe64f5cb844946c1f102bd25bbd87a5ab4ae89fbe',
        '0xf0e406c49c63abf358030a299c0e00118c4c6ba5',
        '0x72faa679e1008ad8382959ff48e392042a8b06f7',
        '0x948d2a81086a075b3130bac19e4c6dee1d2e3fe8',
        '0x5ac52ee5b2a633895292ff6d8a89bb9190451587',
        '0x78650b139471520656b9e7aa7a5e9276814a38e9',
        '0x928e55dab735aa8260af3cedada18b5f70c72f1b',
        '0xf16e81dce15b08f326220742020379b855b87df9',
        '0xacb2d47827c9813ae26de80965845d80935afd0b',
      ],
    },
    {
      chain: ChainNames.fantom,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: [
        '0x10010078a54396f62c96df8532dc2b4847d47ed3',
        '0xf16e81dce15b08f326220742020379b855b87df9',
        '0x01e77288b38b416f972428d562454fb329350bac',
      ],
    },
    {
      chain: ChainNames.linea,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1701302400, // Thu Nov 30 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.mantle,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1707523200, // Sat Feb 10 2024 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: [
        '0x81ab7e0d570b01411fcc4afd3d50ec8c241cb74b',
        '0x47536f17f4ff30e64a96a7555826b8f9e66ec468',
        '0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3',
      ],
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: ['0x19782d3dc4701ceeedcd90f0993f0a9126ed89d0'],
    },
    {
      chain: ChainNames.polygonzkevm,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1681776000, // Tue Apr 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.scroll,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.gnosis,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      blacklists: ['0x5cb9073902f2035222b9749f8fb0c9bfe5527108', '0x82dfe19164729949fd66da1a37bc70dd6c4746ce'],
    },
    {
      chain: ChainNames.zksync,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1681776000, // Tue Apr 18 2023 00:00:00 GMT+0000
      address: '0xadde7028e7ec226777e5dea5d53f6457c21ec7d6',
    },
    {
      chain: ChainNames.mode,
      protocol: ProtocolNames.bungee,
      metric: DataMetrics.ecosystem,
      birthday: 1715990400, // Sat May 18 2024 00:00:00 GMT+0000
      address: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
  ],
};
