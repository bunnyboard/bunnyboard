// help to query token metadata from blockchains

const fs = require('fs');
const axios = require('axios');

const dataPath = './src/configs/data/tokenlists';

const blockchains = {
  ethereum: 1,
  optimism: 10,
  bnbchain: 56,
  arbitrum: 42161,
  base: 8453,
  polygon: 137,
  avalanche: 43114,
  fantom: 250,
  metis: 1088,
  gnosis: 100,
  scroll: 534352,
  blast: 81457,
  linea: 59144,
  zksync: 324,
  mode: 34443,
  manta: 169,
  aurora: 1313161554,
  mantle: 5000,
  polygonzkevm: 1101,
  zora: 7777777,
  merlin: 4200,
  celo: 42220,
};

const tokenlists = [
  // uniswap
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/arbitrum.json',
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/avalanche.json',
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/base.json',
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/bnb.json',
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/celo.json',
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/mainnet.json',
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/optimism.json',
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/polygon.json',

  // uniswap extended
  'https://raw.githubusercontent.com/Uniswap/extended-token-list/main/src/tokens/arbitrum.json',
  'https://raw.githubusercontent.com/Uniswap/extended-token-list/main/src/tokens/celo.json',
  'https://raw.githubusercontent.com/Uniswap/extended-token-list/main/src/tokens/mainnet.json',
  'https://raw.githubusercontent.com/Uniswap/extended-token-list/main/src/tokens/optimism.json',
  'https://raw.githubusercontent.com/Uniswap/extended-token-list/main/src/tokens/polygon.json',

  // uniswap unsupported tokens list
  'https://raw.githubusercontent.com/flashbots/uniswap-interface/main/src/constants/tokenLists/unsupported.tokenlist.json',

  // sushi
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/arbitrum.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/avalanche.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/base.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/blast.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/bsc.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/celo.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/ethereum.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/fantom.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/gnosis.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/harmony.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/linea.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/metis.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/optimism.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/polygon-zkevm.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/polygon.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/scroll.json',
  'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/zksync-era.json',

  // pancakeswap
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/cmc.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/coingecko.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-arbitrum-default.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-base-default.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-bnb-mm.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-default.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-eth-default.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-eth-mm.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-extended.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-linea-default.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-mini.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-onramp.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-polygon-zkevm-default.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-scroll-default.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-top-100.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-top-15.json',
  'https://raw.githubusercontent.com/pancakeswap/token-list/main/lists/pancakeswap-zksync-default.json',
];

function getChainName(chainId) {
  for (const [name, id] of Object.entries(blockchains)) {
    if (Number(chainId) === id) {
      return name;
    }
  }

  return null;
}

function formatAddress(address) {
  return address.toLowerCase();
}

async function getTokens() {
  // chain => address => Token
  const tokens = {};

  for (const urlList of tokenlists) {
    console.log(`> ...getting tokens from ${urlList}`);

    const response = await axios.get(urlList);

    let responseTokens = [];
    if (response.data && response.data.tokens) {
      responseTokens = response.data.tokens;
    } else {
      responseTokens = response.data;
    }

    for (const tokenInfo of responseTokens) {
      const chain = getChainName(tokenInfo.chainId);

      if (chain) {
        if (!tokens[chain]) {
          tokens[chain] = {};
        }

        const address = formatAddress(tokenInfo.address);
        tokens[chain][address] = {
          chain: chain,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          address: address,
          logoURI: tokenInfo.logoURI,
        };
      }

      if (tokenInfo.extensions && tokenInfo.extensions.bridgeInfo) {
        for (const [bridgeChainId, tokenBridgeInfo] of Object.entries(tokenInfo.extensions.bridgeInfo)) {
          const bridgeChain = getChainName(bridgeChainId);

          if (bridgeChain) {
            if (!tokens[bridgeChain]) {
              tokens[bridgeChain] = {};
            }

            const bridgeAddress = formatAddress(tokenBridgeInfo.tokenAddress);
            tokens[bridgeChain][bridgeAddress] = {
              chain: bridgeChain,
              symbol: tokenInfo.symbol,
              decimals: tokenInfo.decimals,
              address: bridgeAddress,
              logoURI: tokenInfo.logoURI,
            };
          }
        }
      }
    }
  }

  return tokens;
}

function saveTokens(chainTokens) {
  for (const [chain, tokens] of Object.entries(chainTokens)) {
    const filePath = `${dataPath}/${chain}.json`;

    if (fs.existsSync(filePath)) {
      const existedTokens = JSON.parse(fs.readFileSync(filePath).toString());
      for (const [address, token] of Object.entries(existedTokens)) {
        tokens[address] = token;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(tokens));
  }
}

(async function () {
  const tokens = await getTokens();

  saveTokens(tokens);
})();
