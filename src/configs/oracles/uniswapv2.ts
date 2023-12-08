import { OracleSourceUniv2 } from '../../types/configs';
import AvalancheTokenList from '../tokenlists/avalanche.json';
import BnbchainTokenList from '../tokenlists/bnbchain.json';
import EthereumTokenList from '../tokenlists/ethereum.json';
import PolygonTokenList from '../tokenlists/polygon.json';

export const OracleSourceUniswapv2List: { [key: string]: OracleSourceUniv2 } = {
  '1INCH_WETH': {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x26aad2da94c59524ac0d93f6d6cbf9071d7086f2',
    baseToken: EthereumTokenList['1INCH'],
    quotaToken: EthereumTokenList.WETH,
  },
  TUSD_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xb4d0d9df2738abe81b87b66c80851292492d1404',
    baseToken: EthereumTokenList.TUSD,
    quotaToken: EthereumTokenList.WETH,
  },
  LEND_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xab3f9bf1d81ddb224a2014e98b238638824bcf20',
    baseToken: EthereumTokenList.LEND,
    quotaToken: EthereumTokenList.WETH,
  },
  REP_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x8979a3ef9d540480342ac0f56e9d4c88807b1cba',
    baseToken: EthereumTokenList.REPv2,
    quotaToken: EthereumTokenList.WETH,
  },
  MKR_DAI: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x517f9dd285e75b599234f7221227339478d0fcc8',
    baseToken: EthereumTokenList.MKR,
    quotaToken: EthereumTokenList.DAI,
  },
  MANA_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x11b1f53204d03e5529f09eb3091939e4fd8c9cf3',
    baseToken: EthereumTokenList.MANA,
    quotaToken: EthereumTokenList.WETH,
  },
  ZRX_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xc6f348dd3b91a56d117ec0071c1e9b83c0996de4',
    baseToken: EthereumTokenList.ZRX,
    quotaToken: EthereumTokenList.WETH,
  },
  SNX_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x43ae24960e5534731fc831386c07755a2dc33d47',
    baseToken: EthereumTokenList.SNX,
    quotaToken: EthereumTokenList.WETH,
  },
  ENJ_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xe56c60b5f9f7b5fc70de0eb79c6ee7d00efa2625',
    baseToken: EthereumTokenList.ENJ,
    quotaToken: EthereumTokenList.WETH,
  },
  REN_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x611cde65dea90918c0078ac0400a72b0d25b9bb1',
    baseToken: EthereumTokenList.REN,
    quotaToken: EthereumTokenList.WETH,
  },
  YFI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x088ee5007c98a9677165d78dd2109ae4a3d04d0c',
    baseToken: EthereumTokenList.YFI,
    quotaToken: EthereumTokenList.WETH,
  },
  AAVE_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xd75ea151a61d06868e31f8988d28dfe5e9df57b4',
    baseToken: EthereumTokenList.AAVE,
    quotaToken: EthereumTokenList.WETH,
  },
  UNI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xd3d2e2692501a5c9ca623199d38826e513033a17',
    baseToken: EthereumTokenList.UNI,
    quotaToken: EthereumTokenList.WETH,
  },
  CRV_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x3da1313ae46132a397d90d95b1424a9a7e3e0fce',
    baseToken: EthereumTokenList.CRV,
    quotaToken: EthereumTokenList.WETH,
  },
  BAL_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xa70d458a4d9bc0e6571565faee18a48da5c0d593',
    baseToken: EthereumTokenList.BAL,
    quotaToken: EthereumTokenList.WETH,
  },
  xSUSHI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7',
    baseToken: EthereumTokenList.xSUSHI,
    quotaToken: EthereumTokenList.WETH,
  },
  AMPL_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xc5be99a02c6857f9eac67bbce58df5572498f40c',
    baseToken: EthereumTokenList.AMPL,
    quotaToken: EthereumTokenList.WETH,
  },
  DPI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x4d5ef58aac27d99935e5b6b4a6778ff292059991',
    baseToken: EthereumTokenList.DPI,
    quotaToken: EthereumTokenList.WETH,
  },
  FRAX_USDC: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x97c4adc5d28a86f9470c70dd91dc6cc2f20d2d4d',
    baseToken: EthereumTokenList.FRAX,
    quotaToken: EthereumTokenList.USDC,
  },
  FEI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x94b0a3d511b6ecdb17ebf877278ab030acb0a878',
    baseToken: EthereumTokenList.FEI,
    quotaToken: EthereumTokenList.WETH,
  },
  stETH_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x4028daac072e492d34a3afdbef0ba7e35d8b55c4',
    baseToken: EthereumTokenList.stETH,
    quotaToken: EthereumTokenList.WETH,
  },
  UST_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x9a0cc6791a5409ce3547f1f1d00e058c79d0a72c',
    baseToken: EthereumTokenList.UST,
    quotaToken: EthereumTokenList.WETH,
  },
  CVX_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x05767d9ef41dc40689678ffca0608878fb3de906',
    baseToken: EthereumTokenList.CVX,
    quotaToken: EthereumTokenList.WETH,
  },
  GHST_USDC: {
    type: 'univ2',
    chain: 'polygon',
    address: '0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4',
    baseToken: PolygonTokenList.GHST,
    quotaToken: PolygonTokenList['USDC.e'],
  },
  SUSHI_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x795065dcc9f64b5614c407a6efdc400da6221fb0',
    baseToken: EthereumTokenList.SUSHI,
    quotaToken: EthereumTokenList.WETH,
  },
  jEUR_WETH: {
    type: 'univ2',
    chain: 'polygon',
    address: '0x7090f6f42ea9b07c85e46ad796f8c4a50e0f76fa',
    baseToken: PolygonTokenList.jEUR,
    quotaToken: PolygonTokenList.WETH,
  },
  COMP_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x31503dcb60119a812fee820bb7042752019f2355',
    baseToken: EthereumTokenList.COMP,
    quotaToken: EthereumTokenList.WETH,
  },
  FXS_FRAX: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0xe1573b9d29e2183b1af0e743dc2754979a40d237',
    baseToken: EthereumTokenList.FXS,
    quotaToken: EthereumTokenList.FRAX,
  },
  miMATIC_USDC: {
    type: 'univ2',
    chain: 'polygon',
    address: '0x160532d2536175d65c03b97b0630a9802c274dad',
    baseToken: PolygonTokenList.miMATIC,
    quotaToken: PolygonTokenList['USDC.e'],
  },
  MaticX_WMATIC: {
    type: 'univ2',
    chain: 'polygon',
    address: '0xb0e69f24982791dd49e316313fd3a791020b8bf7',
    baseToken: PolygonTokenList.MaticX,
    quotaToken: PolygonTokenList.WMATIC,
  },
  sAVAX_WAVAX: {
    type: 'univ2',
    chain: 'avalanche',
    address: '0x4b946c91c2b1a7d7c40fb3c130cdfbaf8389094d',
    baseToken: AvalancheTokenList.sAVAX,
    quotaToken: AvalancheTokenList.WAVAX,
  },
  ALPHA_WETH: {
    type: 'univ2',
    chain: 'ethereum',
    address: '0x70235a346a1ec1d7a40181ff88a3a2e5260e1d04',
    baseToken: EthereumTokenList.ALPHA,
    quotaToken: EthereumTokenList.WETH,
  },
  ADA_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x28415ff2c35b65b9e5c7de82126b4015ab9d031f',
    baseToken: BnbchainTokenList.ADA,
    quotaToken: BnbchainTokenList.WBNB,
  },
  BCH_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x29b839540c07cc0d4b06611859b01a762cf94cf4',
    baseToken: BnbchainTokenList.BCH,
    quotaToken: BnbchainTokenList.WBNB,
  },
  BETH_ETH: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xfb72d7c0f1643c96c197a98e5f36ebcf7597d0e3',
    baseToken: BnbchainTokenList.BETH,
    quotaToken: BnbchainTokenList.ETH,
  },
  CAKE_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x0ed7e52944161450477ee417de9cd3a859b14fd0',
    baseToken: BnbchainTokenList.CAKE,
    quotaToken: BnbchainTokenList.WBNB,
  },
  DOGE_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xac109c8025f272414fd9e2faa805a583708a017f',
    baseToken: BnbchainTokenList.DOGE,
    quotaToken: BnbchainTokenList.WBNB,
  },
  DOT_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xdd5bad8f8b360d76d12fda230f8baf42fe0022cf',
    baseToken: BnbchainTokenList.DOT,
    quotaToken: BnbchainTokenList.WBNB,
  },
  LTC_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x71b01ebddd797c8e9e0b003ea2f4fd207fbf46cc',
    baseToken: BnbchainTokenList.LTC,
    quotaToken: BnbchainTokenList.WBNB,
  },
  LUNA_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xeb8d08030017bd1362a5414112cacb094fa20ce1',
    baseToken: BnbchainTokenList.LUNA,
    quotaToken: BnbchainTokenList.WBNB,
  },
  SXP_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xd8e2f8b6db204c405543953ef6359912fe3a88d6',
    baseToken: BnbchainTokenList.SXP,
    quotaToken: BnbchainTokenList.WBNB,
  },
  WIN_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x894bd57afd8efc93d9171cb585d11d0977557425',
    baseToken: BnbchainTokenList.WIN,
    quotaToken: BnbchainTokenList.WBNB,
  },
  BTT_BUSD: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0xb7e73daee6a6ca37a21f8e4bfba4da448dfe4d92',
    baseToken: BnbchainTokenList.BTT,
    quotaToken: BnbchainTokenList.BUSD,
  },
  BNBx_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x6c83E45fE3Be4A9c12BB28cB5BA4cD210455fb55',
    baseToken: BnbchainTokenList.BNBx,
    quotaToken: BnbchainTokenList.WBNB,
  },
  XRP_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x03f18135c44c64ebfdcbad8297fe5bdafdbbdd86',
    baseToken: BnbchainTokenList.XRP,
    quotaToken: BnbchainTokenList.WBNB,
  },
  XVS_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x7eb5d86fd78f3852a3e0e064f2842d45a3db6ea2',
    baseToken: BnbchainTokenList.XVS,
    quotaToken: BnbchainTokenList.WBNB,
  },
  HAY_BUSD: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x70c26e9805ec5df3d4ab0b2a3df86bba2231b6c1',
    baseToken: BnbchainTokenList.HAY,
    quotaToken: BnbchainTokenList.BUSD,
  },
  ALPACA_BUSD: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x7752e1fa9f3a2e860856458517008558deb989e3',
    baseToken: BnbchainTokenList.ALPACA,
    quotaToken: BnbchainTokenList.BUSD,
  },
  RACA_BUSD: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x8e744ec2795c8b836689d1b4ebe1489204357dac',
    baseToken: BnbchainTokenList.RACA,
    quotaToken: BnbchainTokenList.BUSD,
  },
  BSW_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x46492b26639df0cda9b2769429845cb991591e0a',
    baseToken: BnbchainTokenList.BSW,
    quotaToken: BnbchainTokenList.WBNB,
  },
  ANKR_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x3147f98b8f9c53acdf8f16332ead12b592a1a4ae',
    baseToken: BnbchainTokenList.ANKR,
    quotaToken: BnbchainTokenList.WBNB,
  },
  TWT_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x3dcb1787a95d2ea0eb7d00887704eebf0d79bb13',
    baseToken: BnbchainTokenList.TWT,
    quotaToken: BnbchainTokenList.WBNB,
  },
  FLOKI_WBNB: {
    type: 'univ2',
    chain: 'bnbchain',
    address: '0x231d9e7181e8479a8b40930961e93e7ed798542c',
    baseToken: BnbchainTokenList.FLOKI,
    quotaToken: BnbchainTokenList.WBNB,
  },
  QI_WAVAX: {
    type: 'univ2',
    chain: 'avalanche',
    address: '0xe530dc2095ef5653205cf5ea79f8979a7028065c',
    baseToken: AvalancheTokenList.QI,
    quotaToken: AvalancheTokenList.WAVAX,
  },
  SD_USDC: {
    type: 'univ2',
    chain: 'polygon',
    address: '0x7d196c0c447fde421c72f88a1900bf3322f20e0a',
    baseToken: PolygonTokenList.SD,
    quotaToken: PolygonTokenList['USDC.e'],
  },
};
