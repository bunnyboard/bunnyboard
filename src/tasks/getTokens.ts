import axios from 'axios';
import * as fs from 'fs';

export const TokenDefaultList: Array<string> = [
  'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
  'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/mc.tokenlist.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/ethereum.json',
  'https://apiv5.paraswap.io/tokens/1',
  'https://apiv5.paraswap.io/tokens/42161',
  'https://apiv5.paraswap.io/tokens/8453',
  'https://apiv5.paraswap.io/tokens/10',
  'https://apiv5.paraswap.io/tokens/137',
  'https://apiv5.paraswap.io/tokens/56',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/src/tokens/pancakeswap-top-100.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/src/tokens/pancakeswap-bnb-mm.json',
  'https://apiv5.paraswap.io/tokens/250',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/fantom.json',
  'https://apiv5.paraswap.io/tokens/43114',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/avalanche.json',
];

const chains: any = {
  1: 'ethereum',
  10: 'optimism',
  56: 'bnbchain',
  137: 'polygon',
  8453: 'base',
  42161: 'arbitrum',
  250: 'fantom',
  43114: 'avalanche',
};

(async function () {
  const tokenByChains: any = {
    ethereum: {},
    arbitrum: {},
    polygon: {},
    optimism: {},
    bnbchain: {},
    base: {},
    fantom: {},
    avalanche: {},
  };

  for (const list of TokenDefaultList) {
    const response = await axios.get(list);
    const tokens = response.data.tokens ? response.data.tokens : response.data;

    for (const token of tokens) {
      const chain = token.chainId ? chains[token.chainId] : chains[token.network];
      if (chain) {
        tokenByChains[chain][token.symbol] = {
          chain,
          symbol: token.symbol,
          decimals: token.decimals,
          address: token.address.toLowerCase(),
        };
      }
    }
  }

  for (const [chain, tokens] of Object.entries(tokenByChains)) {
    fs.writeFileSync(`./src/configs/tokenlists/${chain}.json`, JSON.stringify(tokens));
  }
})();
