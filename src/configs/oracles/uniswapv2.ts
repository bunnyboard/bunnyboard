import { OracleSourceUniv2 } from '../../types/oracles';
import AvalancheTokenList from '../tokenlists/avalanche.json';
import BnbchainTokenList from '../tokenlists/bnbchain.json';
import EthereumTokenList from '../tokenlists/ethereum.json';
import GnosisTokenList from '../tokenlists/gnosis.json';
import OptimismTokenList from '../tokenlists/optimism.json';
import PolygonTokenList from '../tokenlists/polygon.json';

export const OracleSourceUniswapv2List: { [key: string]: OracleSourceUniv2 } = {
  '1INCH_WETH': {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x26aad2da94c59524ac0d93f6d6cbf9071d7086f2',
    baseToken: EthereumTokenList['0x111111111117dc0aa78b770fa6a738034120c302'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  TUSD_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xb4d0d9df2738abe81b87b66c80851292492d1404',
    baseToken: EthereumTokenList['0x0000000000085d4780b73119b644ae5ecd22b376'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  REP_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x8979a3ef9d540480342ac0f56e9d4c88807b1cba',
    baseToken: EthereumTokenList['0x1985365e9f78359a9b6ad760e32412f4a445e862'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  MKR_DAI: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x517f9dd285e75b599234f7221227339478d0fcc8',
    baseToken: {
      chain: 'ethereum',
      symbol: 'MKR',
      decimals: 18,
      address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    },
    quotaToken: EthereumTokenList['0x6b175474e89094c44da98b954eedeac495271d0f'],
  },
  MANA_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x11b1f53204d03e5529f09eb3091939e4fd8c9cf3',
    baseToken: EthereumTokenList['0x0f5d2fb29fb7d3cfee444a200298f468908cc942'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  ZRX_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xc6f348dd3b91a56d117ec0071c1e9b83c0996de4',
    baseToken: EthereumTokenList['0xe41d2489571d322189246dafa5ebde1f4699f498'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  SNX_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x43ae24960e5534731fc831386c07755a2dc33d47',
    baseToken: EthereumTokenList['0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  ENJ_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xe56c60b5f9f7b5fc70de0eb79c6ee7d00efa2625',
    baseToken: EthereumTokenList['0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  REN_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x611cde65dea90918c0078ac0400a72b0d25b9bb1',
    baseToken: EthereumTokenList['0x408e41876cccdc0f92210600ef50372656052a38'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  YFI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x088ee5007c98a9677165d78dd2109ae4a3d04d0c',
    baseToken: EthereumTokenList['0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  AAVE_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xd75ea151a61d06868e31f8988d28dfe5e9df57b4',
    baseToken: EthereumTokenList['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  UNI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xd3d2e2692501a5c9ca623199d38826e513033a17',
    baseToken: EthereumTokenList['0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  CRV_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x3da1313ae46132a397d90d95b1424a9a7e3e0fce',
    baseToken: EthereumTokenList['0xd533a949740bb3306d119cc777fa900ba034cd52'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  BAL_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xa70d458a4d9bc0e6571565faee18a48da5c0d593',
    baseToken: EthereumTokenList['0xba100000625a3754423978a60c9317c58a424e3d'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  xSUSHI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7',
    baseToken: EthereumTokenList['0x8798249c2e607446efb7ad49ec89dd1865ff4272'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  AMPL_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xc5be99a02c6857f9eac67bbce58df5572498f40c',
    baseToken: EthereumTokenList['0xd46ba6d942050d489dbd938a2c909a5d5039a161'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  DPI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x4d5ef58aac27d99935e5b6b4a6778ff292059991',
    baseToken: EthereumTokenList['0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  FRAX_USDC: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x97c4adc5d28a86f9470c70dd91dc6cc2f20d2d4d',
    baseToken: EthereumTokenList['0x853d955acef822db058eb8505911ed77f175b99e'],
    quotaToken: EthereumTokenList['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  FEI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x94b0a3d511b6ecdb17ebf877278ab030acb0a878',
    baseToken: EthereumTokenList['0x956f47f50a910163d8bf957cf5846d573e7f87ca'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  stETH_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x4028daac072e492d34a3afdbef0ba7e35d8b55c4',
    baseToken: EthereumTokenList['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  UST_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x9a0cc6791a5409ce3547f1f1d00e058c79d0a72c',
    baseToken: EthereumTokenList['0xa693b19d2931d498c5b318df961919bb4aee87a5'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  CVX_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x05767d9ef41dc40689678ffca0608878fb3de906',
    baseToken: EthereumTokenList['0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  GHST_USDC: {
    type: 'univ2',
    chain: 'polygon',
    address: '0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4',
    baseToken: PolygonTokenList['0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7'],
    quotaToken: PolygonTokenList['0x2791bca1f2de4661ed88a30c99a7a9449aa84174'],
  },
  SD_USDC: {
    type: 'univ2',
    chain: 'polygon',
    address: '0x7d196c0c447fde421c72f88a1900bf3322f20e0a',
    baseToken: PolygonTokenList['0x1d734a02ef1e1f5886e66b0673b71af5b53ffa94'],
    quotaToken: PolygonTokenList['0x2791bca1f2de4661ed88a30c99a7a9449aa84174'],
  },
  SUSHI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x795065dcc9f64b5614c407a6efdc400da6221fb0',
    baseToken: EthereumTokenList['0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  jEUR_WETH: {
    type: 'univ2',
    chain: 'polygon',
    address: '0x7090f6f42ea9b07c85e46ad796f8c4a50e0f76fa',
    baseToken: PolygonTokenList['0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c'],
    quotaToken: PolygonTokenList['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'],
  },
  COMP_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x31503dcb60119a812fee820bb7042752019f2355',
    baseToken: EthereumTokenList['0xc00e94cb662c3520282e6f5717214004a7f26888'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  FXS_FRAX: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xe1573b9d29e2183b1af0e743dc2754979a40d237',
    baseToken: EthereumTokenList['0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0'],
    quotaToken: EthereumTokenList['0x853d955acef822db058eb8505911ed77f175b99e'],
  },
  miMATIC_USDC: {
    type: 'univ2',
    chain: 'polygon',
    address: '0x160532d2536175d65c03b97b0630a9802c274dad',
    baseToken: PolygonTokenList['0xa3fa99a148fa48d14ed51d610c367c61876997f1'],
    quotaToken: PolygonTokenList['0x2791bca1f2de4661ed88a30c99a7a9449aa84174'],
  },
  MaticX_WMATIC: {
    type: 'univ2',
    chain: 'polygon',
    address: '0xb0e69f24982791dd49e316313fd3a791020b8bf7',
    baseToken: PolygonTokenList['0xfa68fb4628dff1028cfec22b4162fccd0d45efb6'],
    quotaToken: PolygonTokenList['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'],
  },
  sAVAX_WAVAX: {
    type: 'univ2',
    chain: 'avalanche',
    address: '0x4b946c91c2b1a7d7c40fb3c130cdfbaf8389094d',
    baseToken: AvalancheTokenList['0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be'],
    quotaToken: AvalancheTokenList['0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'],
  },
  ADA_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x28415ff2c35b65b9e5c7de82126b4015ab9d031f',
    baseToken: BnbchainTokenList['0x3ee2200efb3400fabb9aacf31297cbdd1d435d47'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  BCH_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x29b839540c07cc0d4b06611859b01a762cf94cf4',
    baseToken: BnbchainTokenList['0x8ff795a6f4d97e7887c79bea79aba5cc76444adf'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  BETH_ETH: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xfb72d7c0f1643c96c197a98e5f36ebcf7597d0e3',
    baseToken: BnbchainTokenList['0x250632378e573c6be1ac2f97fcdf00515d0aa91b'],
    quotaToken: BnbchainTokenList['0x2170ed0880ac9a755fd29b2688956bd959f933f8'],
  },
  CAKE_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x0ed7e52944161450477ee417de9cd3a859b14fd0',
    baseToken: BnbchainTokenList['0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  DOGE_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xac109c8025f272414fd9e2faa805a583708a017f',
    baseToken: BnbchainTokenList['0xba2ae424d960c26247dd6c32edc70b295c744c43'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  DOT_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xdd5bad8f8b360d76d12fda230f8baf42fe0022cf',
    baseToken: BnbchainTokenList['0x7083609fce4d1d8dc0c979aab8c869ea2c873402'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  LTC_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x71b01ebddd797c8e9e0b003ea2f4fd207fbf46cc',
    baseToken: BnbchainTokenList['0x4338665cbb7b2485a8855a139b75d5e34ab0db94'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  LUNA_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xeb8d08030017bd1362a5414112cacb094fa20ce1',
    baseToken: BnbchainTokenList['0x156ab3346823b651294766e23e6cf87254d68962'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  SXP_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xd8e2f8b6db204c405543953ef6359912fe3a88d6',
    baseToken: BnbchainTokenList['0x47bead2563dcbf3bf2c9407fea4dc236faba485a'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  XRP_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x03f18135c44c64ebfdcbad8297fe5bdafdbbdd86',
    baseToken: BnbchainTokenList['0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  XVS_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x7eb5d86fd78f3852a3e0e064f2842d45a3db6ea2',
    baseToken: BnbchainTokenList['0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63'],
    quotaToken: BnbchainTokenList['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  STETH_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x1c615074c281c5d88acc6914d408d7e71eb894ee',
    baseToken: EthereumTokenList['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  METIS_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xd03dffd02db4b076e3eed9272a6a243a23de16e3',
    baseToken: {
      chain: 'ethereum',
      symbol: 'METIS',
      decimals: 18,
      address: '0x9e32b13ce7f2e80a01932b42553652e053d6ed8e',
    },
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  GNO_WXDAI: {
    type: 'univ2',
    chain: 'gnosis',
    address: '0x321704900d52f44180068caa73778d5cd60695a6',
    baseToken: GnosisTokenList['0x9c58bacc331c9aa871afd802db6379a98e80cedb'],
    quotaToken: GnosisTokenList['0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'],
  },
  SONNE_USDC: {
    type: 'univ2',
    chain: 'optimism',
    address: '0x4e60495550071693bc8bdffc40033d278157eac7',
    baseToken: OptimismTokenList['0x1db2466d9f5e10d7090e7152b68d62703a2245f0'],
    quotaToken: OptimismTokenList['0x7f5c764cbc14f9669b88837ca1490cca17c31607'],
  },
  ALPHA_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xf55C33D94150d93c2cfb833bcCA30bE388b14964',
    baseToken: EthereumTokenList['0xa1faa113cbe53436df28ff0aee54275c13b40975'],
    quotaToken: EthereumTokenList['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
};
