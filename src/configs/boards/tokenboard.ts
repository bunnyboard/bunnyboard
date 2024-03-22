import { DataMetrics, TokenBoardErc20Config } from '../../types/configs';
import { AddressesBook } from '../data';
import TokenListEthereum from '../data/tokenlists/ethereum.json';

export const TokenBoardErc20Configs: Array<TokenBoardErc20Config> = [
  {
    ...TokenListEthereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    protocol: 'maker',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: true,
    birthday: 1573689600, // Thu Nov 14 2019 00:00:00 GMT+0000
    liquidityPools: [
      AddressesBook.ethereum.LiquidityPoolUniswapV2_DAI_WETH,
      AddressesBook.ethereum.LiquidityPoolUniswapV2_DAI_USDT,
      AddressesBook.ethereum.LiquidityPoolUniswapV2_DAI_USDC,
      AddressesBook.ethereum.LiquidityPoolUniswapV2_DAI_MKR,
      AddressesBook.ethereum.LiquidityPoolUniswapV3_DAI_WETH_0_3,
      AddressesBook.ethereum.LiquidityPoolUniswapV3_DAI_WETH_0_0_5,
      AddressesBook.ethereum.LiquidityPoolUniswapV3_DAI_USDT_0_0_1,
      AddressesBook.ethereum.LiquidityPoolUniswapV3_DAI_USDC_0_0_1,
      AddressesBook.ethereum.LiquidityPoolUniswapV3_DAI_USDC_0_0_5,
      AddressesBook.ethereum.LiquidityPoolUniswapV3_DAI_FRAX_0_0_5,
      AddressesBook.ethereum.LiquidityPoolSushi_DAI_WETH,
      AddressesBook.ethereum.LiquidityPoolCurve_DAI_USDT_USDC,
      AddressesBook.ethereum.LiquidityPoolCurve_USDe_DAI,
    ],
  },
  {
    ...TokenListEthereum['0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'],
    protocol: 'maker',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: false,
    birthday: 1511654400, // Sun Nov 26 2017 00:00:00 GMT+0000
    liquidityPools: [
      AddressesBook.ethereum.LiquidityPoolUniswapV2_DAI_MKR,
      AddressesBook.ethereum.LiquidityPoolUniswapV2_MKR_WETH,
      AddressesBook.ethereum.LiquidityPoolUniswapV3_MKR_WETH_1,
      AddressesBook.ethereum.LiquidityPoolUniswapV3_MKR_WETH_0_3,
    ],
  },
];
