import { OracleConfig } from '../../types/oracles';
import { AddressE, AddressF, AddressZero } from '../constants';
import { OracleSourceConfigs } from './sources';

// chain => tokenAddress => config
export const OracleConfigs: { [key: string]: { [key: string]: OracleConfig } } = {
  // tokens on Ethereum
  ethereum: {
    [AddressZero]: OracleSourceConfigs.ETH,
    [AddressE]: OracleSourceConfigs.ETH,
    [AddressF]: OracleSourceConfigs.ETH,
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': OracleSourceConfigs.ETH,
    '0x6b175474e89094c44da98b954eedeac495271d0f': OracleSourceConfigs.DAI,
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': OracleSourceConfigs.USDC,
    '0xdac17f958d2ee523a2206206994597c13d831ec7': OracleSourceConfigs.USDT,
    '0x0000000000085d4780b73119b644ae5ecd22b376': OracleSourceConfigs.TUSD,
    '0x57ab1ec28d129707052df4df418d58a2d46d5f51': OracleSourceConfigs.sUSD,
    '0x0d8775f648430679a709e98d2b0cb6250d2887ef': OracleSourceConfigs.BAT,
    '0x514910771af9ca656af840dff83e8264ecf986ca': OracleSourceConfigs.LINK,
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': OracleSourceConfigs.WBTC,
    '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': OracleSourceConfigs.YFI,
    '0xe41d2489571d322189246dafa5ebde1f4699f498': OracleSourceConfigs.ZRX,
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': OracleSourceConfigs.UNI,
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': OracleSourceConfigs.AAVE,
    '0x4da27a545c0c5b758a6ba100e3a049001de870f5': OracleSourceConfigs.AAVE,
    '0x4fabb145d64652a948d72533023f6e7a623c7c53': OracleSourceConfigs.BUSD,
    '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c': OracleSourceConfigs.ENJ,
    '0xdd974d5c2e2928dea5f71b9825b8b646686bd200': OracleSourceConfigs.KNC,
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': OracleSourceConfigs.MANA,
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': OracleSourceConfigs.MKR,
    '0x408e41876cccdc0f92210600ef50372656052a38': OracleSourceConfigs.REN,
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': OracleSourceConfigs.SNX,
    '0xd533a949740bb3306d119cc777fa900ba034cd52': OracleSourceConfigs.CRV,
    '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd': OracleSourceConfigs.GUSD,
    '0xba100000625a3754423978a60c9317c58a424e3d': OracleSourceConfigs.BAL,
    '0x8798249c2e607446efb7ad49ec89dd1865ff4272': OracleSourceConfigs.xSUSHI,
    '0xd5147bc8e386d91cc5dbe72099dac6c9b99276f5': OracleSourceConfigs.FIL,
    '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919': OracleSourceConfigs.RAI,
    '0xd46ba6d942050d489dbd938a2c909a5d5039a161': OracleSourceConfigs.AMPL,
    '0x8e870d67f660d95d5be530380d0ec0bd388289e1': OracleSourceConfigs.USDP,
    '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b': OracleSourceConfigs.DPI,
    '0x853d955acef822db058eb8505911ed77f175b99e': OracleSourceConfigs.FRAX,
    '0x956f47f50a910163d8bf957cf5846d573e7f87ca': OracleSourceConfigs.FEI,
    '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': OracleSourceConfigs.stETH,
    '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72': OracleSourceConfigs.ENS,
    '0xa693b19d2931d498c5b318df961919bb4aee87a5': OracleSourceConfigs.UST,
    '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b': OracleSourceConfigs.CVX,
    '0x111111111117dc0aa78b770fa6a738034120c302': OracleSourceConfigs['1INCH'],
    '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': OracleSourceConfigs.LUSD,
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': OracleSourceConfigs.wstETH,
    '0xbe9895146f7af43049ca1c1ae358b0541ea49704': OracleSourceConfigs.cbETH,
    '0xae78736cd615f374d3085123a210448e74fc6393': OracleSourceConfigs.rETH,
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32': OracleSourceConfigs.LDO,
    '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': OracleSourceConfigs.GHO,
    '0xd33526068d116ce69f19a9ee46f0bd304f21a51f': OracleSourceConfigs.RPL,
    '0x83f20f44975d03b1b09e64809b757c47f942beea': OracleSourceConfigs.sDAI,
    '0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6': OracleSourceConfigs.STG,
    '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202': OracleSourceConfigs.KNC,
    '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0': OracleSourceConfigs.FXS,
    '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e': OracleSourceConfigs.crvUSD,
    '0x1985365e9f78359a9b6ad760e32412f4a445e862': OracleSourceConfigs.REP,
    '0x221657776846890989a759ba2973e427dff5c9bb': OracleSourceConfigs.REP,
    '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': OracleSourceConfigs.SAI,
    '0xc00e94cb662c3520282e6f5717214004a7f26888': OracleSourceConfigs.COMP,
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': OracleSourceConfigs.SUSHI,
    '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3': OracleSourceConfigs.MIM,
    '0xdb25f211ab05b1c97d595516f45794528a807ad8': OracleSourceConfigs.EURS,
    '0x137ddb47ee24eaa998a535ab00378d6bfa84f893': OracleSourceConfigs.RDNT,
    '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd': OracleSourceConfigs.LRC,
    '0x6810e776880c02933d47db1b9fc05908e5386b96': OracleSourceConfigs.GNO,
    '0xa1faa113cbe53436df28ff0aee54275c13b40975': OracleSourceConfigs.ALPHA,
    '0xc5f0f7b66764f6ec8c8dff7ba683102295e16409': OracleSourceConfigs.FDUSD,
    '0x6c3ea9036406852006290770bedfcaba0e23a0e8': OracleSourceConfigs.PYUSD,
    '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee': OracleSourceConfigs.weETH,
    '0xd71ecff9342a5ced620049e616c5035f1db98620': OracleSourceConfigs.sEUR,
    '0x2ba592f78db6436527729929aaf6c908497cb200': OracleSourceConfigs.CREAM,
    '0xe2f2a5c287993345a840db3b0845fbc70f5935a5': OracleSourceConfigs.mUSD,
    '0x4d224452801aced8b2f0aebe155379bb5d594381': OracleSourceConfigs.APE,
    '0x5e8422345238f34275888049021821e8e08caa1f': OracleSourceConfigs.frxETH,
    '0xac3e018457b222d93114458476f3e3416abbe38f': OracleSourceConfigs.frxETH,
    '0xf951e335afb289353dc249e82926178eac7ded78': OracleSourceConfigs.swETH,
    '0xa35b1b31ce002fbf2058d22f30f95d405200a15b': OracleSourceConfigs.ETHx,
    '0x24ae2da0f361aa4be46b48eb19c91e02c5e4f27e': OracleSourceConfigs.mevETH,
    '0x04c154b66cb340f3ae24111cc767e0184ed00cc6': OracleSourceConfigs.pxETH,
    '0x9ba021b0a9b958b5e75ce9f6dff97c7ee52cb3e6': OracleSourceConfigs.pxETH,
    '0xc581b735a1688071a1746c968e0798d642ede491': OracleSourceConfigs.EUR,
    '0x9a96ec9b57fb64fbc60b423d1f4da7691bd35079': OracleSourceConfigs.AJNA,
    '0x6123b0049f904d730db3c36a31167d9d4121fa6b': OracleSourceConfigs.RBN,
    '0xb23d80f5fefcddaa212212f028021b41ded428cf': OracleSourceConfigs.PRIME,
    '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab': OracleSourceConfigs.COW,
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': OracleSourceConfigs.MATIC,
    '0x8f693ca8d21b157107184d29d398a8d082b38b76': OracleSourceConfigs.DATA,
    '0x808507121b80c02388fad14726482e061b8da827': OracleSourceConfigs.PENDLE,
    '0xd3e4ba569045546d09cf021ecc5dfe42b1d7f6e4': OracleSourceConfigs.MNW,
    '0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24': OracleSourceConfigs.RNDR,
    '0x3845badade8e6dff049820680d1f14bd3903a5d0': OracleSourceConfigs.SAND,
    '0x8a3d77e9d6968b780564936d15b09805827c21fa': OracleSourceConfigs.UCO,
    '0x8ffe40a3d0f80c0ce6b203d5cdc1a6a86d9acaea': OracleSourceConfigs.IGG,
    '0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29': OracleSourceConfigs.FORT,
    '0x8290333cef9e6d528dd5618fb97a76f268f3edd4': OracleSourceConfigs.ANKR,
    '0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e': OracleSourceConfigs.UBT,
    '0x0c10bf8fcb7bf5412187a595ab97a3609160b5c6': OracleSourceConfigs.USDD,
    '0xbc396689893d065f41bc2c6ecbee5e0085233447': OracleSourceConfigs.PERP,
    '0x865377367054516e17014ccded1e7d814edc9ce4': OracleSourceConfigs.DOLA,
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7': OracleSourceConfigs.GRT,
    '0x761a3557184cbc07b7493da0661c41177b2f97fa': OracleSourceConfigs.GROW,
    '0x8daebade922df735c38c80c7ebd708af50815faa': OracleSourceConfigs.tBTC,
    '0x04fa0d235c4abf4bcf4787af4cf447de572ef828': OracleSourceConfigs.UMA,
    '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c': OracleSourceConfigs.BNT,
    '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671': OracleSourceConfigs.NMR,
    '0x41e5560054824ea6b0732e656e3ad64e20e94e45': OracleSourceConfigs.CVC,
    '0x960b236a07cf122663c4303350609a66a7b288c0': OracleSourceConfigs.ANT,
    '0xa117000000f279d81a1d3cc75430faa017fa5a2e': OracleSourceConfigs.ANT,
    '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55': OracleSourceConfigs.BAND,
    '0xec67005c4e498ec7f55e092bd1d35cbc47c91892': OracleSourceConfigs.MLN,
    '0x85eee30c52b0b379b046fb0f85f4f3dc3009afec': OracleSourceConfigs.KEEP,
    '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac': OracleSourceConfigs.STORJ,
    '0xff20817765cb7f73d4bde2e66e067e58d11095c2': OracleSourceConfigs.AMP,
    '0x4fe83213d56308330ec302a8bd641f1d0113a4cc': OracleSourceConfigs.NU,
    '0x4e352cf164e64adcbad318c3a1e222e9eba4ce42': OracleSourceConfigs.MCB,
    '0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70': OracleSourceConfigs.PREMIA,
    '0x70e8de73ce538da2beed35d14187f6959a8eca96': OracleSourceConfigs.XSGD,
    '0x0abdace70d3790235af448c88547603b945604ea': OracleSourceConfigs.DNT,
    '0x6f40d4a6237c257fff2db00fa0510deeecd303eb': OracleSourceConfigs.INST,
    '0xf17a3fe536f8f7847f1385ec1bc967b2ca9cae8d': OracleSourceConfigs.AMKT,
    '0x6f9c26fa731c7ea4139fa669962cf8f1ce6c8b0b': OracleSourceConfigs.OATH,
    '0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a': OracleSourceConfigs.MAGIC,
    '0x4575f41308ec1483f3d399aa9a2826d74da13deb': OracleSourceConfigs.OXT,
    '0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0': OracleSourceConfigs.LOOM,
    '0x42476f744292107e34519f9c357927074ea3f75d': OracleSourceConfigs.LOOM,
    '0x3c3a81e81dc49a522a592e7622a7e711c06bf354': OracleSourceConfigs.MNT,
    '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e': OracleSourceConfigs.POOL,
    '0x01ba67aac7f75f647d94220cc98fb30fcc5105bf': OracleSourceConfigs.LYRA,

    // todo need to find better oracle source
    '0x9d39a5de30e57443bff2a8307a4256c8797a3497': OracleSourceConfigs.USDT,
    '0x5d74468b69073f809d4fae90afec439e69bf6263': OracleSourceConfigs.ETH,
    '0x3d1e5cf16077f349e999d6b21a4f646e83cd90c5': OracleSourceConfigs.ETH,
    '0x583019ff0f430721ada9cfb4fac8f06ca104d0b4': OracleSourceConfigs.ETH,
    '0x43e54c2e7b3e294de3a155785f52ab49d87b9922': OracleSourceConfigs.CRV,
    '0x2027d3b2b58f522178ce4cc4e86e99b7c4de3876': OracleSourceConfigs.USDT,
    '0xc975342a95ccb75378ddc646b8620fa3cd5bc051': OracleSourceConfigs.wstETH,
    '0xc272b96bccdaf1bf98f2197d355066da3c15982a': OracleSourceConfigs.wstETH,

    // ironbank fixed forex
    '0x69681f8fde45345c3870bcd5eaf4a05a60e7d227': OracleSourceConfigs.GBP,
    '0x96e61422b6a9ba0e068b6c5add4ffabc6a4aae27': OracleSourceConfigs.EUR,
    '0xfafdf0c4c1cb09d430bf88c75d88bb46dae09967': OracleSourceConfigs.AUD,
    '0x5555f75e3d5278082200fb451d1b6ba946d8e13b': OracleSourceConfigs.JPY,
    '0x95dfdc8161832e4ff7816ac4b6367ce201538253': OracleSourceConfigs.KRW,
    '0x1cc481ce2bd2ec7bf67d1be64d4878b16078f309': OracleSourceConfigs.CHF,

    // maker dao rwa
    '0x10b2aa5d77aa6484886d8e244f0686ab319a270d': OracleSourceConfigs.MAKER_RWA001,
    '0xaaa760c2027817169d7c8db0dc61a2fb4c19ac23': OracleSourceConfigs.MAKER_RWA002,
    '0x07f0a80ad7aeb7bfb7f139ea71b3c8f7e17156b9': OracleSourceConfigs.MAKER_RWA003,
    '0x873f2101047a62f84456e3b2b13df2287925d3f9': OracleSourceConfigs.MAKER_RWA004,
    '0x6db236515e90fc831d146f5829407746eddc5296': OracleSourceConfigs.MAKER_RWA005,
    '0x4ee03cfbf6e784c462839f5954d60f7c2b60b113': OracleSourceConfigs.MAKER_RWA006,
    '0x078fb926b041a816facced3614cf1e4bc3c723bd': OracleSourceConfigs.MAKER_RWA007,
    '0xb9737098b50d7c536b6416daeb32879444f59fca': OracleSourceConfigs.MAKER_RWA008,
    '0x8b9734bbaa628bfc0c9f323ba08ed184e5b88da2': OracleSourceConfigs.MAKER_RWA009,
    '0x3c7f1379b5ac286eb3636668deae71eaa5f7518c': OracleSourceConfigs.MAKER_RWA012,
    '0xd6c7fd4392d328e4a8f8bc50f4128b64f4db2d4c': OracleSourceConfigs.MAKER_RWA013,
    '0x75dca04c4acc1ffb0aef940e5b49e2c17416008a': OracleSourceConfigs.MAKER_RWA014,
    '0xf5e5e706efc841bed1d24460cd04028075cdbfde': OracleSourceConfigs.MAKER_RWA015,
  },

  // tokens on Arbitrum One
  arbitrum: {
    [AddressZero]: OracleSourceConfigs.ETH,
    [AddressE]: OracleSourceConfigs.ETH,
    [AddressF]: OracleSourceConfigs.ETH,
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': OracleSourceConfigs.DAI,
    '0xf97f4df75117a78c1a5a0dbb814af92458539fb4': OracleSourceConfigs.LINK,
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': OracleSourceConfigs.USDC,
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': OracleSourceConfigs.WBTC,
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': OracleSourceConfigs.ETH,
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': OracleSourceConfigs.USDT,
    '0xba5ddd1f9d7f570dc94a51479a000e3bce967196': OracleSourceConfigs.AAVE,
    '0xd22a58f79e9481d1a88e00c343885a588b34b68b': OracleSourceConfigs.EURS,
    '0x5979d7b546e38e414f7e9822514be443a4800529': OracleSourceConfigs.wstETH,
    '0x3f56e0c36d275367b8c502090edf38289b3dea0d': OracleSourceConfigs.miMATIC,
    '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8': OracleSourceConfigs.rETH,
    '0x93b346b6bc2548da6a1e7d98e9a421b42541425b': OracleSourceConfigs.LUSD,
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831': OracleSourceConfigs.USDC,
    '0x17fc002b466eec40dae837fc4be5c67993ddbd6f': OracleSourceConfigs.FRAX,
    '0x912ce59144191c1204e64559fe8253a0e49e6548': OracleSourceConfigs.ARB,
    '0x3082cc23568ea640225c2467653db90e9250aaa0': OracleSourceConfigs.RDNT,
    '0x354a6da3fcde098f8389cad84b0182725c6c91de': OracleSourceConfigs.COMP,
    '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a': OracleSourceConfigs.GMX,
    '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0': OracleSourceConfigs.UNI,
    '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a': OracleSourceConfigs.MIM,
    '0x2bcc6d6cdbbdc0a4071e48bb3b969b06b3330c07': OracleSourceConfigs.SOL,
    '0x47904963fc8b2340414262125af798b9655e58cd': OracleSourceConfigs.BTC,
    '0xa9004a5421372e1d83fb1f85b0fc986c912f91f3': OracleSourceConfigs.BNB,
    '0xb46a094bc4b0adbd801e14b9db95e05e28962764': OracleSourceConfigs.LTC,
    '0xc14e065b0067de91534e032868f5ac6ecf2c6868': OracleSourceConfigs.XRP,
    '0xc4da4c24fd591125c3f47b340b6f4f76111883d8': OracleSourceConfigs.DOGE,
    '0x565609faf65b92f7be02468acf86f8979423e514': OracleSourceConfigs.AVAX,
    '0x09199d9a5f4448d0848e4395d065e1ad9c4a1f74': OracleSourceConfigs.BONK,
    '0x1922c36f3bc762ca300b4a46bb2102f84b1684ab': OracleSourceConfigs.cmUMAMI,
    '0x2cab3abfc1670d1a452df502e216a66883cdf079': OracleSourceConfigs.L2DAO,
    '0x6a7661795c374c0bfc635934efaddff3a7ee23b6': OracleSourceConfigs.DOLA,
    '0x1debd73e752beaf79865fd6446b0c970eae7732f': OracleSourceConfigs.cbETH,
    '0x3a8b787f78d775aecfeea15706d4221b40f345ab': OracleSourceConfigs.CELR,
    '0x99f40b01ba9c469193b360f72740e416b17ac332': OracleSourceConfigs.MATH,
    '0x51fc0f6660482ea73330e414efd7808811a57fa2': OracleSourceConfigs.PREMIA,
    '0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af': OracleSourceConfigs.SPELL,
    '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55': OracleSourceConfigs.DPX,
    '0xacc51ffdef63fb0c014c882267c3a17261a5ed50': OracleSourceConfigs.DPX,
    '0x32eb7902d4134bf98a28b963d26de779af92a212': OracleSourceConfigs.DPX,
    '0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae': OracleSourceConfigs.BIFI,
    '0x6694340fc020c5e6b96567843da2df01b2ce1eb6': OracleSourceConfigs.STG,
    '0x4e352cf164e64adcbad318c3a1e222e9eba4ce42': OracleSourceConfigs.MCB,
    '0x9d2f299715d94d8a7e6f5eaa8e654e8c74a988a7': OracleSourceConfigs.FXS,
    '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8': OracleSourceConfigs.BAL,
    '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978': OracleSourceConfigs.CRV,
    '0xa0b862f60edef4452f25b4160f177db44deb6cf1': OracleSourceConfigs.GNO,
    '0x23a941036ae778ac51ab04cea08ed6e2fe103614': OracleSourceConfigs.GRT,
    '0x9623063377ad1b27544c965ccd7342f7ea7e88c7': OracleSourceConfigs.GRT,
    '0xd4d42f0b6def4ce0383636770ef773390d85c61a': OracleSourceConfigs.SUSHI,
    '0x1622bf67e6e5747b81866fe0b85178a93c7f86e3': OracleSourceConfigs.UNAMI,
    '0x498c620c7c91c6eba2e3cd5485383f41613b7eb6': OracleSourceConfigs.AMKT,
    '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8': OracleSourceConfigs.PENDLE,
    '0xa1150db5105987cec5fd092273d1e3cbb22b378b': OracleSourceConfigs.OATH,
    '0x9e758b8a98a42d612b3d38b66a22074dc03d7370': OracleSourceConfigs.SIS,
    '0x69eb4fa4a2fbd498c257c57ea8b7655a2559a581': OracleSourceConfigs.DODO,
    '0x539bde0d7dbd336b79148aa742883198bbf60342': OracleSourceConfigs.MAGIC,
    '0xe85b662fe97e8562f4099d8a1d5a92d4b453bf30': OracleSourceConfigs.THALES,
    '0xcafcd85d8ca7ad1e1c6f82f651fa15e33aefd07b': OracleSourceConfigs.WOO,
  },

  // tokens on Optimism
  optimism: {
    [AddressZero]: OracleSourceConfigs.ETH,
    [AddressE]: OracleSourceConfigs.ETH,
    [AddressF]: OracleSourceConfigs.ETH,
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': OracleSourceConfigs.DAI,
    '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6': OracleSourceConfigs.LINK,
    '0x7f5c764cbc14f9669b88837ca1490cca17c31607': OracleSourceConfigs.USDC,
    '0x68f180fcce6836688e9084f035309e29bf0a2095': OracleSourceConfigs.WBTC,
    '0x4200000000000000000000000000000000000006': OracleSourceConfigs.ETH,
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': OracleSourceConfigs.USDT,
    '0x76fb31fb4af56892a25e32cfc43de717950c9278': OracleSourceConfigs.AAVE,
    '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9': OracleSourceConfigs.sUSD,
    '0x4200000000000000000000000000000000000042': OracleSourceConfigs.OP,
    '0x1f32b1c2345538c0c6f582fcb022739c4a194ebb': OracleSourceConfigs.wstETH,
    '0xc40f949f8a4e094d1b49a23ea9241d289b7b2819': OracleSourceConfigs.LUSD,
    '0xdfa46478f9e5ea86d57387849598dbfb2e964b02': OracleSourceConfigs.miMATIC,
    '0x9bcef72be871e61ed4fbbc7630889bee758eb81d': OracleSourceConfigs.rETH,
    '0x0b2c639c533813f4aa9d7837caf62653d097ff85': OracleSourceConfigs.USDC,
    '0x8700daec35af8ff88c16bdf0418774cb3d7599b4': OracleSourceConfigs.SNX,
    '0x1db2466d9f5e10d7090e7152b68d62703a2245f0': OracleSourceConfigs.SONNE,
    '0xb153fb3d196a8eb25522705560ac152eeec57901': OracleSourceConfigs.MIM,
    '0x9560e827af36c94d2ac33a39bce1fe78631088db': OracleSourceConfigs.VELO,
    '0xff733b2a3557a7ed6697007ab5d11b79fdd1b76b': OracleSourceConfigs.ACX,
    '0x395ae52bb17aef68c2888d941736a71dc6d4e125': OracleSourceConfigs.POOL,
    '0xd52f94df742a6f4b4c8b033369fe13a41782bf44': OracleSourceConfigs.L2DAO,
    '0x8ae125e8653821e851f12a49f7765db9a9ce7384': OracleSourceConfigs.DOLA,
    '0x374ad0f47f4ca39c78e5cc54f1c9e426ff8f231a': OracleSourceConfigs.PREMIA,
    '0xe405de8f52ba7559f9df3c368500b6e6ae6cee49': OracleSourceConfigs.ETH,
    '0xf98dcd95217e15e05d8638da4c91125e59590b07': OracleSourceConfigs.KROM,
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': OracleSourceConfigs.LYRA,
    '0x217d47011b23bb961eb6d93ca9945b7501a5bb11': OracleSourceConfigs.THALES,
    '0xc871ccf95024efa2cbce69b5b775d2a1dcf49c1b': OracleSourceConfigs.GROW,
    '0x67ccea5bb16181e7b4109c9c2143c24a1c2205be': OracleSourceConfigs.FXS,
    '0x2e3d870790dc77a83dd1d18184acc7439a53f475': OracleSourceConfigs.FRAX,
    '0xaf9fe3b5ccdae78188b1f8b9a49da7ae9510f151': OracleSourceConfigs.DHT,
    '0x9e1028f5f1d5ede59748ffcee5532509976840e0': OracleSourceConfigs.PERP,
    '0x7fb688ccf682d58f86d7e38e03f9d22e7705448b': OracleSourceConfigs.RAI,
    '0x298b9b95708152ff6968aafd889c6586e9169f1d': OracleSourceConfigs.BTC,
    '0x39fde572a18448f8139b7788099f0a0740f51205': OracleSourceConfigs.OATH,
    '0xaddb6a0412de1ba0f936dcaeb8aaa24578dcf3b2': OracleSourceConfigs.cbETH,
    '0xbfd291da8a403daaf7e5e9dc1ec0aceacd4848b9': OracleSourceConfigs.USX,
    '0xe7798f023fc62146e8aa1b36da45fb70855a77ea': OracleSourceConfigs.UMA,
  },

  // tokens on Base
  base: {
    [AddressZero]: OracleSourceConfigs.ETH,
    [AddressE]: OracleSourceConfigs.ETH,
    [AddressF]: OracleSourceConfigs.ETH,
    '0x4200000000000000000000000000000000000006': OracleSourceConfigs.ETH,
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': OracleSourceConfigs.cbETH,
    '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': OracleSourceConfigs.USDC,
    '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452': OracleSourceConfigs.wstETH,
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': OracleSourceConfigs.USDC,
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': OracleSourceConfigs.DAI,
    '0x9e1028f5f1d5ede59748ffcee5532509976840e0': OracleSourceConfigs.COMP,
    '0x940181a94a35a4569e4529a3cdfb74e38fd98631': OracleSourceConfigs.AERO,
    '0x4ed4e862860bed51a9570b96d89af5e1b0efefed': OracleSourceConfigs.DEGEN,
    '0x22e6966b799c4d5b13be962e1d117b56327fda66': OracleSourceConfigs.SNX,
    '0xfa980ced6895ac314e7de34ef1bfae90a5add21b': OracleSourceConfigs.PRIME,
    '0x0bd4887f7d41b35cd75dff9ffee2856106f86670': OracleSourceConfigs.FRIEND,
    '0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c': OracleSourceConfigs.rETH,
    '0x321725ee44cb4bfa544cf45a5a585b925d30a58c': OracleSourceConfigs.GROW,
    '0x13f4196cc779275888440b3000ae533bbbbc3166': OracleSourceConfigs.AMKT,
  },

  // tokens on Polygon
  polygon: {
    [AddressZero]: OracleSourceConfigs.MATIC,
    [AddressE]: OracleSourceConfigs.MATIC,
    [AddressF]: OracleSourceConfigs.MATIC,
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': OracleSourceConfigs.DAI,
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': OracleSourceConfigs.USDC,
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': OracleSourceConfigs.USDT,
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': OracleSourceConfigs.WBTC,
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': OracleSourceConfigs.ETH,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': OracleSourceConfigs.MATIC,
    '0xd6df932a45c0f255f85145f286ea0b292b21c90b': OracleSourceConfigs.AAVE,
    '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7': OracleSourceConfigs.GHST,
    '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3': OracleSourceConfigs.BAL,
    '0x85955046df4668e1dd369d2de9f3aeb98dd2a369': OracleSourceConfigs.DPI,
    '0x172370d5cd63279efa6d502dab29171933a610af': OracleSourceConfigs.CRV,
    '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a': OracleSourceConfigs.SUSHI,
    '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39': OracleSourceConfigs.LINK,
    '0xe111178a87a3bff0c8d18decba5798827539ae99': OracleSourceConfigs.EURS,
    '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c': OracleSourceConfigs.jEUR,
    '0xe0b52e49357fd4daf2c15e02058dce6bc0057db4': OracleSourceConfigs.agEUR,
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1': OracleSourceConfigs.miMATIC,
    '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': OracleSourceConfigs.stMATIC,
    '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': OracleSourceConfigs.MaticX,
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd': OracleSourceConfigs.wstETH,
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': OracleSourceConfigs.USDC,
    '0x1d734a02ef1e1f5886e66b0673b71af5b53ffa94': OracleSourceConfigs.SD,
    '0xc3c7d422809852031b44ab29eec9f1eff2a58756': OracleSourceConfigs.LDO,
    '0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c': OracleSourceConfigs.COMP,
    '0x2760e46d9bb43dafcbecaad1f64b93207f9f0ed7': OracleSourceConfigs.MVX,
    '0x5fe2b58c013d7601147dcdd68c143a77499f5531': OracleSourceConfigs.GRT,
    '0xb33eaad8d922b1083446dc23f610c2567fb5180f': OracleSourceConfigs.UNI,
    '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4': OracleSourceConfigs.MANA,
    '0xf50d05a1402d0adafa880d36050736f9f6ee7dee': OracleSourceConfigs.INST,
    '0x45c32fa6df82ead1e2ef74d17b76547eddfaff89': OracleSourceConfigs.FRAX,
    '0x50b728d8d964fd00c2d0aad81718b71311fef68a': OracleSourceConfigs.SNX,
    '0xdc3326e71d45186f113a2f448984ca0e8d201995': OracleSourceConfigs.XSGD,
    '0x49a0400587a7f65072c87c4910449fdcc5c47242': OracleSourceConfigs.MIM,
    '0x23001f892c0c82b79303edc9b9033cd190bb21c7': OracleSourceConfigs.LUSD,
    '0x4b4327db1600b8b1440163f667e199cef35385f5': OracleSourceConfigs.cbETH,
    '0xb87904db461005fc716a6bf9f2d451c33b10b80b': OracleSourceConfigs.AMKT,
    '0xc2c52ff5134596f5ff1b1204d3304228f2432836': OracleSourceConfigs.OATH,
    '0x1a3acf6d19267e2d3e7f898f42803e90c9219062': OracleSourceConfigs.FXS,
    '0x42f37a1296b2981f7c3caced84c5096b2eb0c72c': OracleSourceConfigs.KEEP,
    '0x3066818837c5e6ed6601bd5a91b0762877a6b731': OracleSourceConfigs.UMA,
    '0x6f7c932e7684666c9fd1d44527765433e01ff61d': OracleSourceConfigs.MKR,
    '0xbc2b48bc930ddc4e5cfb2e87a45c379aab3aac5c': OracleSourceConfigs.DOLA,
    '0x5559edb74751a0ede9dea4dc23aee72cca6be3d5': OracleSourceConfigs.ZRX,
    '0x66dc5a08091d1968e08c16aa5b27bac8398b02be': OracleSourceConfigs.CVC,
    '0x66efb7cc647e0efab02eba4316a2d2941193f6b3': OracleSourceConfigs.LOOM,
    '0xa8b1e0764f85f53dfe21760e8afe5446d82606ac': OracleSourceConfigs.BAND,
    '0x5ffd62d3c3ee2e81c00a7b9079fb248e7df024a8': OracleSourceConfigs.GNO,
    '0x0266f4f08d82372cf0fcbccc0ff74309089c74d1': OracleSourceConfigs.rETH,
    '0xf81b4bec6ca8f9fe7be01ca734f55b2b6e03a7a0': OracleSourceConfigs.sUSD,
    '0xbd7a5cf51d22930b8b3df6d834f9bcef90ee7c4f': OracleSourceConfigs.ENS,
    '0xd72357daca2cf11a5f155b9ff7880e595a3f5792': OracleSourceConfigs.STORJ,
    '0x6563c1244820cfbd6ca8820fbdf0f2847363f733': OracleSourceConfigs.REP,
    '0x0bf519071b02f22c17e7ed5f4002ee1911f46729': OracleSourceConfigs.NMR,
    '0x324b28d6565f784d596422b0f2e5ab6e9cfa1dc7': OracleSourceConfigs.KNC,
    '0x9880e3dda13c8e7d4804691a45160102d31f6060': OracleSourceConfigs.OXT,
    '0x84e1670f61347cdaed56dcc736fb990fbb47ddc1': OracleSourceConfigs.LRC,
    '0xc26d47d5c33ac71ac5cf9f776d63ba292a4f7842': OracleSourceConfigs.BNT,
    '0x50a4a434247089848991dd8f09b889d4e2870ab6': OracleSourceConfigs.tBTC,
    '0x0621d647cecbfb64b79e44302c1933cb4f27054d': OracleSourceConfigs.AMP,
    '0xda537104d6a5edd53c6fbba9a898708e465260b6': OracleSourceConfigs.YFI,

    // todo need to find better oracle source
    '0xa013fbd4b711f9ded6fb09c1c0d358e2fbc2eaa0': OracleSourceConfigs.USDC,
    '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812': OracleSourceConfigs.USDC,
  },

  // tokens on Bnbchain
  bnbchain: {
    [AddressZero]: OracleSourceConfigs.BNB,
    [AddressE]: OracleSourceConfigs.BNB,
    [AddressF]: OracleSourceConfigs.BNB,
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': OracleSourceConfigs.BNB,
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': OracleSourceConfigs.USDC,
    '0x55d398326f99059ff775485246999027b3197955': OracleSourceConfigs.USDT,
    '0xe9e7cea3dedca5984780bafc599bd69add087d56': OracleSourceConfigs.BUSD,
    '0x47bead2563dcbf3bf2c9407fea4dc236faba485a': OracleSourceConfigs.SXP,
    '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63': OracleSourceConfigs.XVS,
    '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': OracleSourceConfigs.BTC,
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8': OracleSourceConfigs.ETH,
    '0x4338665cbb7b2485a8855a139b75d5e34ab0db94': OracleSourceConfigs.LTC,
    '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe': OracleSourceConfigs.XRP,
    '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf': OracleSourceConfigs.BCH,
    '0x7083609fce4d1d8dc0c979aab8c869ea2c873402': OracleSourceConfigs.DOT,
    '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd': OracleSourceConfigs.LINK,
    '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3': OracleSourceConfigs.DAI,
    '0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153': OracleSourceConfigs.FIL,
    '0x250632378e573c6be1ac2f97fcdf00515d0aa91b': OracleSourceConfigs.BETH,
    '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47': OracleSourceConfigs.ADA,
    '0xba2ae424d960c26247dd6c32edc70b295c744c43': OracleSourceConfigs.DOGE,
    '0xcc42724c6683b7e57334c4e856f4c9965ed682bd': OracleSourceConfigs.MATIC,
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82': OracleSourceConfigs.CAKE,
    '0xfb6115445bff7b52feb98650c87f44907e58f802': OracleSourceConfigs.AAVE,
    '0x14016e85a25aeb13065688cafb43044c2ef86784': OracleSourceConfigs.TUSD,
    '0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b': OracleSourceConfigs.TRX,
    '0x3d4350cd54aef9f9b2c29435e0fa809957b3f30a': OracleSourceConfigs.UST,
    '0x156ab3346823b651294766e23e6cf87254d68962': OracleSourceConfigs.LUNA,
    '0xce7de646e7208a4ef112cb6ed5038fa6cc6b12e3': OracleSourceConfigs.TRX,
    '0xa2e3356610840701bdf5611a53974510ae27e2e1': OracleSourceConfigs.wBETH,
    '0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9': OracleSourceConfigs.TUSD,
    '0xbf5140a22578168fd562dccf235e5d43a02ce9b1': OracleSourceConfigs.UNI,
    '0xc5f0f7b66764f6ec8c8dff7ba683102295e16409': OracleSourceConfigs.FDUSD,
    '0xf7de7e8a6bd59ed41a4b5fe50278b3b7f31384df': OracleSourceConfigs.RDNT,
    '0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba': OracleSourceConfigs.MIM,
    '0xa1faa113cbe53436df28ff0aee54275c13b40975': OracleSourceConfigs.ALPHA,
    '0xca3f508b8e4dd382ee878a314789373d80a5190a': OracleSourceConfigs.BIFI,
    '0x2f29bc0ffaf9bff337b31cbe6cb5fb3bf12e5840': OracleSourceConfigs.DOLA,
    '0xc417b45e6090bd4201d9400b48f84c9f34f4d0a5': OracleSourceConfigs.PREMIA,
    '0x3f56e0c36d275367b8c502090edf38289b3dea0d': OracleSourceConfigs.miMATIC,
    '0x4b0f1812e5df2a09796481ff14017e6005508003': OracleSourceConfigs.TWT,
    '0xa8c2b8eec3d368c0253ad3dae65a5f2bbb89c929': OracleSourceConfigs.CTK,
    '0x4bd17003473389a42daf6a0a729f6fdb328bbbd7': OracleSourceConfigs.VAI,
    '0x23396cf899ca06c4472205fc903bdb4de249d6fc': OracleSourceConfigs.UST,
    '0xb0d502e938ed5f4df2e681fe6e419ff29631d62b': OracleSourceConfigs.STG,
    '0xe48a3d7d0bc88d552f730b62c006bc925eadb9ee': OracleSourceConfigs.FXS,
    '0x90c97f71e18723b0cf0dfa30ee176ab653e89f40': OracleSourceConfigs.FRAX,
    '0x56b6fb708fc5732dec1afc8d8556423a2edccbd6': OracleSourceConfigs.EOS,
    '0x16939ef78684453bfdfb47825f8a5f714f12623a': OracleSourceConfigs.XTZ,
    '0xe02df9e3e622debdd69fb838bb799e3f168902c5': OracleSourceConfigs.BAKE,
    '0xad6caeb32cd2c308980a548bd0bc5aa4306c6c18': OracleSourceConfigs.BAND,
    '0x0eb3a705fc54725037cc9e008bdede697f62f335': OracleSourceConfigs.ATOM,
    '0xf307910a4c7bbc79691fd374889b36d8531b08e3': OracleSourceConfigs.ANKR,
    '0x88f1a5ae2a3bf98aeaf342d26b30a79438c9142e': OracleSourceConfigs.YFI,
    '0xa2b726b1145a4773f68593cf171187d8ebe4d495': OracleSourceConfigs.INJ,
    '0xd3c6ceedd1cc7bd4304f72b011d53441d631e662': OracleSourceConfigs.OATH,
    '0xf98b660adf2ed7d9d9d9daacc2fb0cace4f21835': OracleSourceConfigs.SIS,
    '0xf218184af829cf2b0019f8e6f0b2423498a36983': OracleSourceConfigs.MATH,
    '0x5fe80d2cd054645b9419657d3d10d26391780a7b': OracleSourceConfigs.MCB,
  },

  // tokens on Avalanche C-Chain
  avalanche: {
    [AddressZero]: OracleSourceConfigs.AVAX,
    [AddressE]: OracleSourceConfigs.AVAX,
    [AddressF]: OracleSourceConfigs.AVAX,
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7': OracleSourceConfigs.AVAX,
    '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab': OracleSourceConfigs.ETH,
    '0xd586e7f844cea2f87f50152665bcbc2c279d8d70': OracleSourceConfigs.DAI,
    '0xc7198437980c041c805a1edcba50c1ce5db95118': OracleSourceConfigs.USDT,
    '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664': OracleSourceConfigs.USDC,
    '0x63a72806098bd3d9520cc43356dd78afe5d386d9': OracleSourceConfigs.AAVE,
    '0x50b7545627a5162f82a992c33b87adc75187b218': OracleSourceConfigs.WBTC,
    '0x5947bb275c521040051d82396192181b413227a3': OracleSourceConfigs.LINK,
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': OracleSourceConfigs.USDC,
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': OracleSourceConfigs.USDT,
    '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be': OracleSourceConfigs.sAVAX,
    '0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64': OracleSourceConfigs.FRAX,
    '0x5c49b268c9841aff1cc3b0a418ff5c3442ee3f3b': OracleSourceConfigs.miMATIC,
    '0x152b9d0fdc40c096757f570a51e494bd4b943e50': OracleSourceConfigs.BTC,
    '0x130966628846bfd36ff31a822705796e8cb8c18d': OracleSourceConfigs.MIM,
    '0x2147efff675e4a4ee1c2f918d181cdbd7a8e208f': OracleSourceConfigs.ALPHA,
    '0x34b2885d617ce2dded4f60ccb49809fc17bb58af': OracleSourceConfigs.XRP,
    '0x8e9c35235c38c44b5a53b56a41eaf6db9a430cd6': OracleSourceConfigs.LTC,
    '0xc301e6fe31062c557aee806cc6a841ae989a3ac6': OracleSourceConfigs.DOGE,
    '0xfe6b19286885a4f7f55adad09c3cd1f906d2478f': OracleSourceConfigs.SOL,
    '0xb599c3590f42f8f995ecfa0f85d2980b76862fc1': OracleSourceConfigs.UST,
    '0x260bbf5698121eb85e7a74f2e45e16ce762ebe11': OracleSourceConfigs.UST,
    '0x19e1ae0ee35c0404f835521146206595d37981ae': OracleSourceConfigs.ETH,
    '0x1f1e7c893855525b303f99bdf5c3c05be09ca251': OracleSourceConfigs.SYN,
    '0xce1bffbd5374dac86a2893119683f4911a2f7814': OracleSourceConfigs.SPELL,
    '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590': OracleSourceConfigs.STG,
    '0x62edc0692bd897d2295872a9ffcac5425011c661': OracleSourceConfigs.GMX,
    '0x214db107654ff987ad859f34125307783fc8e387': OracleSourceConfigs.FXS,
    '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd': OracleSourceConfigs.JOE,
    '0x60781c2586d68229fde47564546784ab3faca982': OracleSourceConfigs.PNG,
    '0xd1c3f94de7e5b45fa4edbba472491a9f4b166fc4': OracleSourceConfigs.XAVA,
    '0x8729438eb15e2c8b576fcc6aecda6a148776c0f5': OracleSourceConfigs.QI,
    '0x264c1383ea520f73dd837f915ef3a732e204a493': OracleSourceConfigs.BNB,
    '0x22d4002028f537599be9f666d1c4fa138522f9c8': OracleSourceConfigs.PTP,
  },

  // tokens on Fantom
  fantom: {
    [AddressZero]: OracleSourceConfigs.FTM,
    [AddressE]: OracleSourceConfigs.FTM,
    [AddressF]: OracleSourceConfigs.FTM,
    '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83': OracleSourceConfigs.FTM,
    '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e': OracleSourceConfigs.DAI,
    '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8': OracleSourceConfigs.LINK,
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75': OracleSourceConfigs.USDC,
    '0x321162cd933e2be498cd2267a90534a804051b11': OracleSourceConfigs.WBTC,
    '0x74b23882a30290451a17c44f4f05243b6b58c76d': OracleSourceConfigs.ETH,
    '0x049d68029688eabf473097a2fc38ef61633a3c7a': OracleSourceConfigs.USDT,
    '0x6a07a792ab2965c72a5b8088d3a069a7ac3a993b': OracleSourceConfigs.AAVE,
    '0x1e4f97b9f9f913c46f1632781732927b9019c68b': OracleSourceConfigs.CRV,
    '0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc': OracleSourceConfigs.SUSHI,
    '0x82f0b8b456c1a451378467398982d4834b6829c1': OracleSourceConfigs.MIM,
    '0x29b0da86e484e1c0029b56e817912d778ac0ec69': OracleSourceConfigs.YFI,
    '0xdc301622e621166bd8e82f2ca0a26c13ad0be355': OracleSourceConfigs.FRAX,
    '0x56ee926bd8c72b2d5fa1af4d9e4cbb515a1e3adc': OracleSourceConfigs.SNX,
    '0x9879abdea01a879644185341f7af7d8343556b7a': OracleSourceConfigs.TUSD,
    '0xe2d27f06f63d98b8e11b38b5b08a75d0c8dd62b9': OracleSourceConfigs.UST,
    '0x46e7628e8b4350b2716ab470ee0ba1fa9e76c6c5': OracleSourceConfigs.BAND,
    '0x657a1861c15a3ded9af0b6799a195a249ebdcbc6': OracleSourceConfigs.CREAM,
    '0xaf319e5789945197e365e7f7fbfc56b130523b33': OracleSourceConfigs.FRAX,
    '0x3129662808bec728a27ab6a6b9afd3cbaca8a43c': OracleSourceConfigs.DOLA,
    '0x3028b4395f98777123c7da327010c40f3c7cc4ef': OracleSourceConfigs.PREMIA,
    '0xfb98b335551a418cd0737375a2ea0ded62ea213b': OracleSourceConfigs.miMATIC,
    '0x468003b688943977e6130f4f68f23aad939a1040': OracleSourceConfigs.SPELL,
    '0x7d016eec9c25232b01f23ef992d98ca97fc2af5a': OracleSourceConfigs.FXS,
    '0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6': OracleSourceConfigs.OATH,
  },

  // tokens on metis
  metis: {
    '0x4c078361fc9bbb78df910800a991c7c3dd2f6ce0': OracleSourceConfigs.DAI,
    '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000': OracleSourceConfigs.METIS,
    '0xea32a96608495e54156ae48931a7c20f0dcc1a21': OracleSourceConfigs.USDC,
    '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc': OracleSourceConfigs.USDT,
    '0x420000000000000000000000000000000000000a': OracleSourceConfigs.ETH,
  },

  // tokens on gnosis
  gnosis: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.DAI,
    '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1': OracleSourceConfigs.ETH,
    '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6': OracleSourceConfigs.wstETH,
    '0x9c58bacc331c9aa871afd802db6379a98e80cedb': OracleSourceConfigs.GNO,
    '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83': OracleSourceConfigs.USDC,
    '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d': OracleSourceConfigs.DAI,
    '0xcb444e90d8198415266c6a2724b7900fb12fc56e': OracleSourceConfigs.EURS,
    '0xaf204776c7245bf4147c2612bf6e5972ee483701': OracleSourceConfigs.sXDAI,
    '0x4ecaba5870353805a9f068101a40e0f32ed605c6': OracleSourceConfigs.USDT,
    '0x44fa8e6f47987339850636f88629646662444217': OracleSourceConfigs.DAI,
    '0x3f56e0c36d275367b8c502090edf38289b3dea0d': OracleSourceConfigs.miMATIC,
    '0xd3d47d5578e55c880505dc40648f7f9307c3e7a8': OracleSourceConfigs.DPI,
    '0xe2e73a1c69ecf83f464efce6a5be353a37ca09b2': OracleSourceConfigs.LINK,
    '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252': OracleSourceConfigs.WBTC,
    '0xb7d311e2eb55f2f68a9440da38e7989210b9a05e': OracleSourceConfigs.STAKE,
  },

  // tokens on scroll
  scroll: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
    '0x5300000000000000000000000000000000000004': OracleSourceConfigs.ETH,
    '0xf610a9dfb7c89644979b4a0f27063e9e7d7cda32': OracleSourceConfigs.wstETH,
    '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4': OracleSourceConfigs.USDC,
  },

  // tokens on blast
  blast: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
    '0x4300000000000000000000000000000000000004': OracleSourceConfigs.ETH,
    '0x4300000000000000000000000000000000000003': OracleSourceConfigs.USDC,
    '0x76da31d7c9cbeae102aff34d3398bc450c8374c1': OracleSourceConfigs.MIM,
  },

  // token on aurora
  aurora: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
    '0xb12bfca5a55806aaf64e99521918a4bf0fc40802': OracleSourceConfigs.USDC,
    '0x4988a896b1227218e4a686fde5eabdcabd91571f': OracleSourceConfigs.USDT,
  },

  // token on linea
  linea: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
    '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f': OracleSourceConfigs.ETH,
    '0x176211869ca2b568f2a7d4ee941e073a821ee1ff': OracleSourceConfigs.USDC,
    '0xa219439258ca9da29e9cc4ce5596924745e12b93': OracleSourceConfigs.USDT,
    '0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5': OracleSourceConfigs.DAI,
  },

  mantle: {
    '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111': OracleSourceConfigs.ETH,
    '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9': OracleSourceConfigs.USDC,
  },

  manta: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
  },

  zora: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
  },

  polygonzkevm: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
    '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9': OracleSourceConfigs.ETH,
    '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035': OracleSourceConfigs.USDC,
  },

  zksync: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
    '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91': OracleSourceConfigs.ETH,
    '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4': OracleSourceConfigs.USDC,
    '0x493257fd37edb34451f62edf8d2a0c418852ba4c': OracleSourceConfigs.USDT,
    '0xbbeb516fb02a01611cbbe0453fe3c580d7281011': OracleSourceConfigs.WBTC,
  },

  mode: {
    '0x0000000000000000000000000000000000000000': OracleSourceConfigs.ETH,
    '0x4200000000000000000000000000000000000006': OracleSourceConfigs.ETH,
    '0xd988097fb8612cc24eec14542bc03424c656005f': OracleSourceConfigs.USDC,
    '0xf0f161fda2712db8b566946122a5af183995e2ed': OracleSourceConfigs.USDT,
  },
};
