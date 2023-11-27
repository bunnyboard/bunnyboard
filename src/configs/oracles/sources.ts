import { OracleConfig } from '../../types/configs';
import { OracleSourceChainlinkList } from './chainlink';
import { OracleCurrencyBaseConfigs } from './currency';
import { OracleSourceCustomList } from './custom';
import { OracleSourceUniswapv2List } from './uniswapv2';
import { OracleSourceUniswapv3List } from './uniswapv3';

// symbol => OracleConfig
export const OracleSourceConfigs: { [key: string]: OracleConfig } = {
  ETH: OracleCurrencyBaseConfigs.eth,
  BNB: OracleCurrencyBaseConfigs.bnb,
  MATIC: OracleCurrencyBaseConfigs.matic,
  AVAX: OracleCurrencyBaseConfigs.avax,
  FTM: OracleCurrencyBaseConfigs.ftm,
  DAI: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.DAI_USD],
    coingeckoId: 'dai',
  },
  USDC: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDC_USD],
    coingeckoId: 'usd-coin',
  },
  USDT: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDT_USD],
    coingeckoId: 'tether',
  },
  sUSD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDT_USD],
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
    coingeckoId: 'basic-attention-token',
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
    coingeckoId: 'augur',
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
    currency: 'btc',
    sources: [OracleSourceChainlinkList.WBTC_BTC],
  },
  BUSD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BUSD_USD],
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
    sources: [OracleSourceChainlinkList.GUSD_USD],
  },
  FIL: {
    // renFIL
    currency: 'eth',
    sources: [OracleSourceChainlinkList.FIL_ETH],
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
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.LUSD_USDC],
  },
  SUSHI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SUSHI_WETH],
  },
  wstETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.wstETH_WETH],
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
    sources: [OracleSourceUniswapv3List.EURS_USDC],
  },
  sEUR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.EURS_USDC],
  },
  MIM: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.MIM_USDC],
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
    sources: [OracleSourceUniswapv2List.jEUR_WETH],
  },
  agEUR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.agEUR_USDC],
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
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.ADA_WBNB],
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
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.DOGE_WBNB],
  },
  DOT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.DOT_WBNB],
  },
  LTC: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.LTC_WBNB],
  },
  LUNA: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.LUNA_WBNB],
  },
  SXP: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.SXP_WBNB],
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
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.XRP_WBNB],
  },
  XVS: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.XVS_WBNB],
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
};
