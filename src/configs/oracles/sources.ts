import { OracleConfig } from '../../types/oracles';
import { OracleSourceChainlinkList } from './chainlink';
import { OracleCurrencyBaseConfigs } from './currency';
import { OracleSourceCurveList } from './curve';
import { OracleSourceCustomList } from './custom';
import { OracleSourceUniswapv2List } from './uniswapv2';
import { OracleSourceUniswapv3List } from './uniswapv3';

// symbol => OracleConfig
export const OracleSourceConfigs: { [key: string]: OracleConfig } = {
  ETH: OracleCurrencyBaseConfigs.eth,
  BNB: OracleCurrencyBaseConfigs.bnb,
  BTC: OracleCurrencyBaseConfigs.btc,
  MATIC: OracleCurrencyBaseConfigs.matic,
  AVAX: OracleCurrencyBaseConfigs.avax,
  FTM: OracleCurrencyBaseConfigs.ftm,
  DAI: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.DAI_USD],
    stablecoin: true,
  },
  USDC: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDC_USD],
    stablecoin: true,
  },
  USDT: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDT_USD],
    stablecoin: true,
  },
  EUR: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
  sUSD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDT_USD],
    stablecoin: true,
  },
  TUSD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TUSD_WETH],
  },
  LEND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LEND_WETH],
  },
  BAT: {
    currency: 'eth',
    sources: [OracleSourceChainlinkList.BAT_ETH],
  },
  LINK: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.LINK_USD],
  },
  KNC: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.KNC_USD],
  },
  REP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.REP_WETH],
  },
  MKR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MKR_DAI],
  },
  MANA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MANA_WETH],
  },
  ZRX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZRX_WETH],
  },
  SNX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SNX_WETH],
  },
  WBTC: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WBTC_USDT],
  },
  BUSD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BUSD_USD],
    stablecoin: true,
  },
  ENJ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ENJ_WETH],
  },
  REN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.REN_WETH],
  },
  YFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.YFI_WETH],
  },
  AAVE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AAVE_WETH],
  },
  UNI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UNI_WETH],
  },
  CRV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CRV_WETH],
  },
  EOS: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EOS_USD],
  },
  XTZ: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.XTZ_USD],
  },
  BAL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BAL_WETH],
  },
  xSUSHI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.xSUSHI_WETH],
  },
  GUSD: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceChainlinkList.GUSD_USD, OracleSourceCurveList.GUSD_METAPOOL],
  },
  mkUSD: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceCurveList.mkUSD_USDC],
  },
  ULTRA: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceCurveList.ULTRA_USDC],
  },
  FIL: {
    // FIl on bnbchain and renFIL on ethereum
    currency: 'usd',
    sources: [OracleSourceChainlinkList.FIL_USD],
  },
  RAI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.RAI_DAI],
  },
  USDP: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDP_USD],
    stablecoin: true,
  },
  AMPL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AMPL_WETH],
  },
  DPI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DPI_WETH],
  },
  FRAX: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.FRAX_USDC],
    stablecoin: true,
  },
  FEI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FEI_WETH],
  },
  stETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.stETH_WETH],
  },
  ENS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ENS_WETH],
  },
  UST: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.UST_BUSD],
  },
  CVX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CVX_WETH],
  },
  '1INCH': {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List['1INCH_WETH']],
  },
  LUSD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LUSD_WETH],
  },
  SUSHI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SUSHI_WETH],
  },
  wstETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.wstETH_WETH, OracleSourceUniswapv3List.wstETH_WETH_2],
  },
  cbETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.cbETH_WETH],
  },
  rETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.rETH_WETH],
  },
  LDO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LDO_WETH],
  },
  GHO: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceChainlinkList.GHO_USD],
  },
  RPL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.RPL_WETH],
  },
  sDAI: {
    currency: 'usd',
    sources: [OracleSourceCustomList.SAVING_DAI],
  },
  STG: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.STG_USDC],
  },
  COMP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.COMP_WETH],
  },
  SAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SAI_WETH],
  },
  EURS: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
  sEUR: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
  MIM: {
    currency: 'eth',
    stablecoin: true,
    sources: [OracleSourceCurveList.MIM_METAPOOL, OracleSourceUniswapv2List.MIM_WETH],
  },
  FXS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.FXS_FRAX],
  },
  ARB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ARB_WETH],
  },
  OP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OP_WETH],
  },
  GHST: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.GHST_USDC],
  },
  jEUR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.jEUR_WETH, OracleSourceChainlinkList.EUR_USD],
  },
  agEUR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.agEUR_USDC, OracleSourceChainlinkList.EUR_USD],
  },
  miMATIC: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.miMATIC_USDC],
  },
  stMATIC: {
    currency: 'matic',
    sources: [OracleSourceUniswapv3List.stMATIC_WMATIC],
  },
  MaticX: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.MaticX_WMATIC],
  },
  ALPHA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ALPHA_WETH],
  },
  sAVAX: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.sAVAX_WAVAX],
  },
  ADA: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.ADA_USD],
  },
  BCH: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BCH_USD],
  },
  BETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BETH_ETH],
  },
  CAKE: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.CAKE_WBNB],
  },
  DOGE: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.DOGE_USD],
  },
  DOT: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.DOT_USD],
  },
  LTC: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.LTC_USD],
  },
  LUNA: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.LUNA_WBNB],
  },
  SXP: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.SXP_USD],
  },
  wBETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.wBETH_ETH],
  },
  WIN: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.WIN_WBNB],
  },
  BTT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BTT_BUSD],
  },
  SnBNB: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.SbBNB_WBNB],
  },
  stkBNB: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.stkBNB_WBNB],
  },
  ankrBNB: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.ankrBNB_WBNB],
  },
  BNBx: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.BNBx_WBNB],
  },
  TRX: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.TRX_USD],
  },
  USDD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDD_USD],
  },
  XRP: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.XRP_USD],
  },
  XVS: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.XVS_USD],
  },
  HAY: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.HAY_BUSD],
  },
  ALPACA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.ALPACA_BUSD],
  },
  RACA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.RACA_BUSD],
  },
  BSW: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.BSW_WBNB],
  },
  ANKR: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.ANKR_WBNB],
  },
  TWT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.TWT_WBNB],
  },
  FLOKI: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.FLOKI_WBNB],
  },
  crvUSD: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceChainlinkList.crvUSD_USD],
  },
  QI: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.QI_WAVAX],
  },
  SD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.SD_USDC],
  },
  vBTC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.vBTC_WETH],
  },
  CREAM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CREAM_WETH],
  },
  BAC: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BAC_DAI],
  },
  NFTX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NFTX_WETH],
  },
  STETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.STETH_WETH],
  },
  pONT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.pONT_WETH],
  },
  DOLA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DOLA_WETH],
  },
  OHMv1: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.OHMv1_DAI],
  },
  OHM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OHM_WETH],
  },
  SONNE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.SONNE_USDC],
  },
  METIS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.METIS_WETH],
  },
  GNO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.GNO_WETH],
  },
  sXDAI: {
    currency: 'usd',
    sources: [OracleSourceCustomList.SAVING_xDAI],
  },
  RDNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.RDNT_WETH],
  },
  GBP: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.GBP_USD],
  },
  AUD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.AUD_USD],
  },
  JPY: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.JPY_USD],
  },
  KRW: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.KRW_USD],
  },
  CHF: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.CHF_USD],
  },
  FDUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.FDUSD_USDT],
  },
  LRC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LRC_WETH],
  },
  MAKER_RWA001: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA001],
  },
  MAKER_RWA002: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA002],
  },
  MAKER_RWA003: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA003],
  },
  MAKER_RWA004: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA004],
  },
  MAKER_RWA005: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA005],
  },
  MAKER_RWA006: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA006],
  },
  MAKER_RWA007: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA007],
  },
  MAKER_RWA009: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA009],
  },
  MAKER_RWA008: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA008],
  },
  MAKER_RWA012: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA012],
  },
  MAKER_RWA013: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA013],
  },
  MAKER_RWA014: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA014],
  },
  MAKER_RWA015: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA015],
  },
  GMX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GMX_WETH],
  },
  SOL: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.SOL_USD],
  },
  PYUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.PYUSD_USDC],
  },
  weETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.weETH_WETH],
  },
  AERO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.AERO_USDC],
  },
  mUSD: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceCurveList.mUSD_METAPOOL],
  },
  BAND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BAND_WETH],
  },
  APE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.APE_WETH],
  },
  frxETH: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.frxETH_FRAX],
  },
  swETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.swETH_WETH],
  },
  ETHx: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ETHx_WETH],
  },
  mevETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.mevETH_WETH],
  },
  pxETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.pxETH_WETH],
  },
  VELO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.VELO_USDC],
  },
  AJNA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.AJNA_WETH],
  },
  RBN: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.RBN_USDC],
  },
  PRIME: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PRIME_WETH],
  },
  COW: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.COW_WETH],
  },
  DEGEN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.DEGEN_WETH],
  },
  FRIEND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FRIEND_WETH],
  },
  DATA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DATA_WETH],
  },
  PENDLE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PENDLE_WETH],
  },
  RNDR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RNDR_WETH],
  },
  SAND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SAND_WETH],
  },
  UCO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UCO_WETH],
  },
  IGG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IGG_WETH],
  },
  MNW: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MNW_WETH],
  },
  ACX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ACX_WETH],
  },
  POOL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.POOL_WETH],
  },
  FORT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.FORT_WETH],
  },
  UBT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UBT_WETH],
  },
  PERP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PERP_WETH],
  },
  GRT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GRT_WETH],
  },
  MAGIC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MAGIC_WETH],
  },
  GROW: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GROW_WETH],
  },
  tBTC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.tBTC_WETH],
  },
  UMA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UMA_WETH],
  },
  BNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BNT_WETH],
  },
  NMR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.NMR_WETH],
  },
  MCB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MCB_WETH],
  },
  INST: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.INST_WETH],
  },
  XSGD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.XSDG_WETH],
  },
  CVC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CVC_WETH],
  },
  ANT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ANT_WETH],
  },
  MLN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MNL_WETH],
  },
  KEEP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KEEP_WETH],
  },
  AMKT: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.AMKT_WBTC],
  },
  STORJ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.STORJ_WETH],
  },
  AMP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AMP_WETH],
  },
  NU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NU_WETH],
  },
  OATH: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.OATH_WFTM],
  },
  PREMIA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PREMIA_WETH],
  },
  LOOM: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.LOOM_USDC],
  },
  MNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MNT_WETH],
  },
  BONK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BONK_WETH],
  },
  DNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DNT_WETH],
  },
  OXT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.OXT_WETH],
  },
  cmUMAMI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.cmUMAMI_WETH],
  },
  L2DAO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.L2DAO_WETH],
  },
  CELR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.CELR_WETH],
  },
  MATH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MATH_WETH],
  },
  SPELL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SPELL_WETH],
  },
  DPX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DPX_WETH],
  },
  BIFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BIFI_WETH],
  },
  UNAMI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UNAMI_WETH],
  },
  SIS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SIS_WETH],
  },
  DODO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DODO_WETH],
  },
  THALES: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.THALES_WETH],
  },
  WOO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.WOO_WETH],
  },
  KROM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.KROM_WETH],
  },
  LYRA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.LYRA_USDC],
  },
  DHT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DHT_WETH],
  },
  USX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.USX_USDC],
  },
  STAKE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.STAKE_XDAI],
  },
  MVX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MVX_WETH],
  },
  CTK: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.CTK_WBNB],
  },
  SYN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SYN_WETH],
  },
  VAI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.VAI_BUSD],
  },
  BAKE: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.BAKE_WBNB],
  },
  ATOM: {
    currency: 'bnb',
    sources: [OracleSourceChainlinkList.ATOM_USD],
  },
  INJ: {
    currency: 'bnb',
    sources: [OracleSourceChainlinkList.INJ_USD],
  },
  JOE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.JOE_USDC],
  },
  PNG: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.PNG_USDC],
  },
  XAVA: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.XAVA_WAVAX],
  },
  PTP: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.PTP_WAVAX],
  },
  USDM: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USDM_USDT],
  },
  USDA: {
    currency: 'eur',
    sources: [OracleSourceUniswapv3List.USDA_EURA],
  },
  USDe: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USDe_USDT],
  },
  ezETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ezETH_WETH],
  },
  osETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.osETH_WETH],
  },
  tBTCv2: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.tBTC_WBTC],
  },
  BADGER: {
    currency: 'btc',
    sources: [OracleSourceUniswapv2List.BADGER_WBTC],
  },
  LIT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LIT_WETH],
  },
  rswETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.rswETH_WETH],
  },
  USD0: {
    currency: 'usd',
    stablecoin: true,
    sources: [],
  },
  USC: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceUniswapv2List.USC_USDC],
  },
  CDCETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CDCETH_WETH],
  },
  GRAI: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceUniswapv3List.GRAI_USDC],
  },
  sFRAX: {
    currency: 'usd',
    sources: [OracleSourceCustomList.sFRAX],
  },
  sDOLA: {
    currency: 'usd',
    sources: [OracleSourceCustomList.sDOLA],
  },
  FPI: {
    currency: 'usd',
    stablecoin: true,
    sources: [],
  },
  rsETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.rsETH_WETH],
  },
  CRO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WCRO_USDC],
  },
  RON: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WRON_USDC],
  },
};
