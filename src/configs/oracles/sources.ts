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
  EUR: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
  sUSD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDT_USD],
    coingeckoId: 'nusd',
    stablecoin: true,
  },
  TUSD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TUSD_WETH],
    coingeckoId: 'true-usd',
  },
  LEND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LEND_WETH],
    coingeckoId: 'ethlend',
  },
  BAT: {
    currency: 'eth',
    sources: [OracleSourceChainlinkList.BAT_ETH],
    coingeckoId: 'basic-attention-token',
  },
  LINK: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.LINK_USD],
    coingeckoId: 'chainlink',
  },
  KNC: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.KNC_USD],
    coingeckoId: 'kyber-network',
  },
  REP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.REP_WETH],
    coingeckoId: 'augur',
  },
  MKR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MKR_DAI],
    coingeckoId: 'maker',
  },
  MANA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MANA_WETH],
    coingeckoId: 'decentraland',
  },
  ZRX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZRX_WETH],
    coingeckoId: '0x',
  },
  SNX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SNX_WETH],
    coingeckoId: 'havven',
  },
  WBTC: {
    currency: 'btc',
    sources: [OracleSourceChainlinkList.WBTC_BTC],
    coingeckoId: 'wrapped-bitcoin',
  },
  BUSD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BUSD_USD],
    coingeckoId: 'binance-usd',
  },
  ENJ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ENJ_WETH],
    coingeckoId: 'enjincoin',
  },
  REN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.REN_WETH],
    coingeckoId: 'republic-protocol',
  },
  YFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.YFI_WETH],
    coingeckoId: 'yearn-finance',
  },
  AAVE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AAVE_WETH],
    coingeckoId: 'aave',
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
    coingeckoId: 'gemini-dollar',
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
    coingeckoId: 'paxos-standard',
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
    coingeckoId: 'terrausd',
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
    coingeckoId: 'liquity-usd',
  },
  SUSHI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SUSHI_WETH],
    coingeckoId: 'sushi',
  },
  wstETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.wstETH_WETH],
    coingeckoId: 'wrapped-steth',
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
    coingeckoId: 'compound-governance-token',
  },
  SAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SAI_WETH],
    coingeckoId: 'sai',
  },
  EURS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.EURS_USDC],
    coingeckoId: 'stasis-eurs',
  },
  sEUR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.EURS_USDC],
  },
  MIM: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.MIM_USDC],
    coingeckoId: 'magic-internet-money',
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
    coingeckoId: 'optimism',
  },
  GHST: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.GHST_USDC],
  },
  jEUR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.jEUR_WETH],
    coingeckoId: 'jarvis-synthetic-euro',
  },
  agEUR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.agEUR_USDC],
    coingeckoId: 'ageur',
  },
  miMATIC: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.miMATIC_USDC],
  },
  stMATIC: {
    currency: 'matic',
    sources: [OracleSourceUniswapv3List.stMATIC_WMATIC],
    coingeckoId: 'lido-staked-matic',
  },
  MaticX: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.MaticX_WMATIC],
    coingeckoId: 'stader-maticx',
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
    coingeckoId: 'cardano',
  },
  BCH: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BCH_USD],
    coingeckoId: 'bitcoin-cash',
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
    coingeckoId: 'swipe',
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
    coingeckoId: 'venus',
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
  RWA001: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA001],
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
