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

    // ironbank fixed forex
    '0x69681f8fde45345c3870bcd5eaf4a05a60e7d227': OracleSourceConfigs.GBP,
    '0x96e61422b6a9ba0e068b6c5add4ffabc6a4aae27': OracleSourceConfigs.EUR,
    '0xfafdf0c4c1cb09d430bf88c75d88bb46dae09967': OracleSourceConfigs.AUD,
    '0x5555f75e3d5278082200fb451d1b6ba946d8e13b': OracleSourceConfigs.JPY,
    '0x95dfdc8161832e4ff7816ac4b6367ce201538253': OracleSourceConfigs.KRW,
    '0x1cc481ce2bd2ec7bf67d1be64d4878b16078f309': OracleSourceConfigs.CHF,

    // maker dao rwa
    '0x10b2aa5d77aa6484886d8e244f0686ab319a270d': OracleSourceConfigs.RWA001,
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
    '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1': OracleSourceConfigs.ETH,
    '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6': OracleSourceConfigs.wstETH,
    '0x9c58bacc331c9aa871afd802db6379a98e80cedb': OracleSourceConfigs.GNO,
    '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83': OracleSourceConfigs.USDC,
    '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d': OracleSourceConfigs.DAI,
    '0xcb444e90d8198415266c6a2724b7900fb12fc56e': OracleSourceConfigs.EURS,
    '0xaf204776c7245bf4147c2612bf6e5972ee483701': OracleSourceConfigs.sXDAI,
  },
};
