import { expect, test } from 'vitest';

import { TokenListBase } from '../../configs';
import { SushiEthereumDexConfig, Sushiv3EthereumDexConfig } from '../../configs/protocols/sushi';
import { Uniswapv2EthereumDexConfig, Uniswapv3EthereumDexConfig } from '../../configs/protocols/uniswap';
import UniswapLibs from './uniswap';

const blockNumber = 19490072; // Mar-22-2024 12:09:47 PM +UTC
const blockNumberAfter = 19495184; // Mar-23-2024 05:22:23 AM +UTC

test('should get data liquidity token from subgraph correctly: uniswapv2 - DAI - ethereum', async function () {
  const tokenData = await UniswapLibs.getLiquidityTokenSnapshot({
    token: TokenListBase.ethereum.DAI,
    dexConfig: Uniswapv2EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  expect(tokenData).not.equal(null);
  if (tokenData) {
    expect(tokenData.protocol).equal('uniswapv2');
    expect(tokenData.tokenPrice).equal('0.99966786171174172036');
    expect(tokenData.totalLiquidity).equal('76791804.074180520621259701');
    expect(tokenData.feesTrading).equal('23596.34008159013667732626');
    expect(tokenData.feesTradingCumulative).equal('63948435.32931789797739757172');
    expect(tokenData.volumeTrading).equal('7865446.693863378892442087');
    expect(tokenData.volumeTradingCumulative).equal('21316145109.772632659132523907');
    expect(tokenData.numberOfTransactions).equal(694);
    expect(tokenData.numberOfTransactionsCumulative).equal(2847731);
  }
});

test('should get data liquidity token from subgraph correctly: uniswapv3 - DAI - ethereum', async function () {
  const tokenData = await UniswapLibs.getLiquidityTokenSnapshot({
    token: TokenListBase.ethereum.DAI,
    dexConfig: Uniswapv3EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  expect(tokenData).not.equal(null);
  if (tokenData) {
    expect(tokenData.protocol).equal('uniswapv3');
    expect(tokenData.tokenPrice).equal('1');
    expect(tokenData.totalLiquidity).equal('111852484.708043171702511368');
    expect(tokenData.feesTrading).equal('76014.34064550035435957778');
    expect(tokenData.feesTradingCumulative).equal('69757604.78866343384124828318');
    expect(tokenData.volumeTrading).equal('69750115.345387046830603655');
    expect(tokenData.volumeTradingCumulative).equal('79859685992.747087351234184508');
    expect(tokenData.numberOfTransactions).equal(1749);
    expect(tokenData.numberOfTransactionsCumulative).equal(2055491);
  }
});

test('should get data liquidity token from subgraph correctly: sushi - SUSHI - ethereum', async function () {
  const tokenData = await UniswapLibs.getLiquidityTokenSnapshot({
    token: {
      chain: 'ethereum',
      symbol: 'SUSHI',
      decimals: 18,
      address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    },
    dexConfig: SushiEthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  expect(tokenData).not.equal(null);
  if (tokenData) {
    expect(tokenData.tokenPrice).equal('1.68609099970301118315');
    expect(tokenData.totalLiquidity).equal('2015314.299763879338413754');
    expect(tokenData.feesTrading).equal('376.88568287571143703994');
    expect(tokenData.volumeTrading).equal('125628.560958570479013313');
    expect(tokenData.volumeTradingCumulative).equal('2717278112.945898897292678898');
    expect(tokenData.numberOfTransactions).equal(65);
    expect(tokenData.numberOfTransactionsCumulative).equal(604467);
  }
});

test('should get data liquidity token from subgraph correctly: sushiv3 - SUSHI - ethereum', async function () {
  const tokenData = await UniswapLibs.getLiquidityTokenSnapshot({
    token: TokenListBase.ethereum.SUSHI,
    dexConfig: Sushiv3EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  expect(tokenData).not.equal(null);
  if (tokenData) {
    expect(tokenData.protocol).equal('sushiv3');
    expect(tokenData.tokenPrice).equal('1.77650011155065751571');
    expect(tokenData.totalLiquidity).equal('238090.586287259186425359');
    expect(tokenData.feesTrading).equal('59.43810374072740039609');
    expect(tokenData.volumeTrading).equal('19634.348821476361697609');
    expect(tokenData.volumeTradingCumulative).equal('12362832.341063244039682125');
    expect(tokenData.numberOfTransactions).equal(8);
    expect(tokenData.numberOfTransactionsCumulative).equal(2926);
  }
});

test('should get data liquidity pool from subgraph correctly: uniswapv2 - UNI - ethereum', async function () {
  const pools = await UniswapLibs.getTopLiquidityPoolForToken({
    token: TokenListBase.ethereum.UNI,
    dexConfig: Uniswapv2EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  const pool_UNI_WETH = pools[0];

  const poolData = await UniswapLibs.getLiquidityPoolSnapshot(pool_UNI_WETH, {
    token: TokenListBase.ethereum.UNI,
    dexConfig: Uniswapv2EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  expect(poolData).not.equal(null);
  if (poolData) {
    expect(poolData.protocol).equal('uniswapv2');
    expect(poolData.address).equal('0xd3d2e2692501a5c9ca623199d38826e513033a17');
    expect(poolData.feesPercentage).equal(0.3);
    expect(poolData.tokens[0].address).equal(TokenListBase.ethereum.UNI.address);
    expect(poolData.tokens[1].address).equal(TokenListBase.ethereum.WETH.address);
    expect(poolData.tokenPrices[0]).equal('11.76291537704713912955');
    expect(poolData.tokenPrices[1]).equal('3326.27001687473904164337');
    expect(poolData.tokenBalances[0]).equal('277110.027291387961888372');
    expect(poolData.tokenBalances[1]).equal('979.963077147435008203');
    expect(poolData.totalLiquidityUsd).equal('6523573.41637701767915957177');
    expect(poolData.feesTradingUsd).equal('266.30123231554726327876');
    expect(poolData.feesTradingUsd).equal('266.30123231554726327876');
    expect(poolData.feesTradingCumulativeUsd).equal('24277311.43694794530859604812');
    expect(poolData.volumeTradingCumulativeUsd).equal('8092437145.64931510286534937486');
    expect(poolData.numberOfTransactions).equal(48);
    expect(poolData.numberOfTransactionsCumulative).equal(754919);
  }
});

test('should get data liquidity pool from subgraph correctly: uniswapv3 - UNI - ethereum', async function () {
  const pools = await UniswapLibs.getTopLiquidityPoolForToken({
    token: TokenListBase.ethereum.UNI,
    dexConfig: Uniswapv3EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  // should be UNI_WETH pool
  const pool_UNI_WETH = pools[0];

  const poolData = await UniswapLibs.getLiquidityPoolSnapshot(pool_UNI_WETH, {
    token: TokenListBase.ethereum.UNI,
    dexConfig: Uniswapv3EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  expect(poolData).not.equal(null);
  if (poolData) {
    expect(poolData.protocol).equal('uniswapv3');
    expect(poolData.feesPercentage).equal(0.3);
    expect(poolData.address).equal('0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801');
    expect(poolData.tokens[0].address).equal(TokenListBase.ethereum.UNI.address);
    expect(poolData.tokens[1].address).equal(TokenListBase.ethereum.WETH.address);
    expect(poolData.tokenPrices[0]).equal('11.74860599895370970743');
    expect(poolData.tokenPrices[1]).equal('3325.75606091795014047382');
    expect(poolData.tokenBalances[0]).equal('3456788.65065412120097582');
    expect(poolData.tokenBalances[1]).equal('8702.800199669553919939');
    expect(poolData.totalLiquidityUsd).equal('69555838.38919907347040035659');
    expect(poolData.feesTradingUsd).equal('12050.33719181215494957212');
    expect(poolData.volumeTradingUsd).equal('4016779.06393738498319070773');
    expect(poolData.volumeTradingCumulativeUsd).equal('5812762474.27896796733183976804');
    expect(poolData.numberOfTransactions).equal(123);
    expect(poolData.numberOfTransactionsCumulative).equal(218544);
  }
});

test('should get data liquidity pool from subgraph correctly: sushi - SUSHI - ethereum', async function () {
  const pools = await UniswapLibs.getTopLiquidityPoolForToken({
    token: {
      chain: 'ethereum',
      symbol: 'SUSHI',
      decimals: 18,
      address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    },
    dexConfig: SushiEthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  // should be SUSHI_WETH pool
  const pool_SUSHI_WETH = pools[0];

  const poolData = await UniswapLibs.getLiquidityPoolSnapshot(pool_SUSHI_WETH, {
    token: {
      chain: 'ethereum',
      symbol: 'SUSHI',
      decimals: 18,
      address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    },
    dexConfig: SushiEthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  expect(poolData).not.equal(null);
  if (poolData) {
    expect(poolData.protocol).equal('sushi');
    expect(poolData.feesPercentage).equal(0.3);
    expect(poolData.tokens[0].address).equal(TokenListBase.ethereum.SUSHI.address);
    expect(poolData.tokens[1].address).equal(TokenListBase.ethereum.WETH.address);
    expect(poolData.tokenPrices[0]).equal('1.66731434242847877296');
    expect(poolData.tokenPrices[1]).equal('3325.86962881637555295857');
    expect(poolData.tokenBalances[0]).equal('1986827.291662343647335788');
    expect(poolData.tokenBalances[1]).equal('996.029913684825120573');
    expect(poolData.totalLiquidityUsd).equal('6627415.87643764499407687584');
    expect(poolData.feesTradingUsd).equal('626.08685511810182816316');
    expect(poolData.volumeTradingUsd).equal('208695.61837270060938771873');
    expect(poolData.volumeTradingCumulativeUsd).equal('15728113244.7392256730419414718');
    expect(poolData.numberOfTransactions).equal(63);
    expect(poolData.numberOfTransactionsCumulative).equal(557702);
  }
});

test('should get data liquidity pool from subgraph correctly: sushiv3 - SUSHI - ethereum', async function () {
  const pools = await UniswapLibs.getTopLiquidityPoolForToken({
    token: TokenListBase.ethereum.SUSHI,
    dexConfig: Sushiv3EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  // should be SUSHI_WETH pool
  const pool_SUSHI_WETH = pools[0];

  const poolData = await UniswapLibs.getLiquidityPoolSnapshot(pool_SUSHI_WETH, {
    token: TokenListBase.ethereum.SUSHI,
    dexConfig: Sushiv3EthereumDexConfig,
    fromBlock: blockNumber,
    toBlock: blockNumberAfter,
  });

  expect(poolData).not.equal(null);
  if (poolData) {
    expect(poolData.protocol).equal('sushiv3');
    expect(poolData.feesPercentage).equal(0.3);
    expect(poolData.address).equal('0x87c7056bbe6084f03304196be51c6b90b6d85aa2');
    expect(poolData.tokens[0].address).equal(TokenListBase.ethereum.SUSHI.address);
    expect(poolData.tokens[1].address).equal(TokenListBase.ethereum.WETH.address);
    expect(poolData.tokenPrices[0]).equal('1.80403905933977943776');
    expect(poolData.tokenPrices[1]).equal('3572.39334805150346408217');
    expect(poolData.tokenBalances[0]).equal('238090.586287259186425359');
    expect(poolData.tokenBalances[1]).equal('133.479053860236013671');
    expect(poolData.totalLiquidityUsd).equal('906364.4014378391425174767');
    expect(poolData.feesTradingUsd).equal('105.59179792576178056878');
    expect(poolData.volumeTradingUsd).equal('35197.26597525392685625879');
    expect(poolData.volumeTradingCumulativeUsd).equal('12687596.00698498349129435682');
    expect(poolData.numberOfTransactions).equal(8);
    expect(poolData.numberOfTransactionsCumulative).equal(2926);
  }
});
