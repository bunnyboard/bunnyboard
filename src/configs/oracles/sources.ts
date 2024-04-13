import { OracleConfig } from '../../types/oracles';
import { OracleSourceChainlinkList } from './chainlink';
import { OracleCurrencyBaseConfigs } from './currency';
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
    sources: [OracleSourceChainlinkList.GUSD_USD, OracleSourceCustomList.GUSD_METAPOOL],
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
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UST_WETH],
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
    sources: [OracleSourceUniswapv3List.GHO_USDC],
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
    sources: [OracleSourceUniswapv3List.SAI_WETH],
  },
  EURS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.EURS_USDC, OracleSourceChainlinkList.EUR_USD],
  },
  sEUR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.EURS_USDC],
  },
  MIM: {
    currency: 'eth',
    sources: [OracleSourceCustomList.MIM_METAPOOL, OracleSourceUniswapv2List.MIM_WETH],
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
    sources: [OracleSourceUniswapv3List.crvUSD_USDC],
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
  PENDLE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PENDLE_WETH],
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
};
