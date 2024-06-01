import { Token } from '../../configs';

export interface BungeeGatewayDataTimeframe {
  protocol: string;
  chain: string;
  timestamp: number;

  // socket gateway contract address
  address: string;

  // values should be in USD
  // and were calculated at transaction timestamp
  volumeBridgeUsd: number;

  // breakdown the bridge volume by destination chain
  // for example, total volume out of Ethereum is $10m
  // and there are $2m to Optimism, $5m to Arbitrum and $3m to Base
  // volumeBridgeDestinations should be: optimism: 2m, arbitrum: 5m, base 3m
  volumeBridgeUsdDestinations: {
    // chain => volumeBridge
    [key: string]: number;
  };

  // breakdown the bridge volume by bridge layer
  volumeBridgeUsdProtocols: {
    // protocol => volumeBridge
    [key: string]: number;
  };

  // breakdown the bridge volume by tokens
  volumeBridgeTokens: {
    // tokenAddress => Token, volume
    [key: string]: {
      token: Token;
      tokenPrice: number;

      // value in token unit, ex: 2 ETH, 1.2 WBTC
      tokenVolume: number;
    };
  };

  addresses: Array<string>;
  transactions: Array<string>;
}

export interface BungeeGatewayDataStateWithTimeframe extends BungeeGatewayDataTimeframe {
  // previous day data
  last24Hours: BungeeGatewayDataTimeframe | null;
}
