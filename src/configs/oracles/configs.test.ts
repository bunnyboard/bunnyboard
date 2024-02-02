import { expect, test } from 'vitest';

import { Token } from '../../types/configs';
import TokenListArbitrum from '../tokenlists/arbitrum.json';
import TokenListAvalanche from '../tokenlists/avalanche.json';
import TokenListBase from '../tokenlists/base.json';
import TokenListBnbchain from '../tokenlists/bnbchain.json';
import TokenListEthereum from '../tokenlists/ethereum.json';
import TokenListFantom from '../tokenlists/fantom.json';
import TokenListGnosis from '../tokenlists/gnosis.json';
import TokenListMetis from '../tokenlists/metis.json';
import TokenListOptimism from '../tokenlists/optimism.json';
import TokenListPolygon from '../tokenlists/polygon.json';
import { OracleConfigs } from './configs';

const TokenLists: Array<{ [key: string]: Token }> = [
  TokenListArbitrum,
  TokenListAvalanche,
  TokenListBase,
  TokenListBnbchain,
  TokenListEthereum,
  TokenListFantom,
  TokenListGnosis,
  TokenListMetis,
  TokenListOptimism,
  TokenListPolygon,
];

const Blacklists: { [key: string]: Array<string> } = {
  bnbchain: ['0x20bff4bbeda07536ff00e073bd8359e5d80d733d'],
};

// make sur we have oracle configs for all tokens
for (const list of TokenLists) {
  for (const [, token] of Object.entries(list)) {
    test(`should have oracle config for token ${token.chain}:${token.address}`, function () {
      if (!Blacklists[token.chain] || Blacklists[token.chain].indexOf(token.address) === -1) {
        expect(OracleConfigs[token.chain][token.address]).not.equal(undefined);
      }
    });
    // test(`can get token price ${token.chain}:${token.address}`, async function () {
    //   if (!Blacklists[token.chain] || Blacklists[token.chain].indexOf(token.address) === -1) {
    //     const tokenPrice = await oracle.getTokenPriceUsd({
    //       chain: token.chain,
    //       address: token.address,
    //       timestamp: getTimestamp(),
    //     });
    //     expect(tokenPrice).not.equal(null);
    //     expect(tokenPrice).not.equal('0');
    //   }
    // });
  }
}
