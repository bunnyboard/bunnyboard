// binance exchange will be used to get token price
// when the token was not available on-chain trading yet
// for example, ETH before the ChainLink price feed was deployed

export const OffchainOracleSourcesFromBinance = {
  ETH: {
    source: 'binance',
    ticker: 'ETHUSDT',
  },
};
