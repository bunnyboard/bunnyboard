import { expect } from 'chai';
import { describe } from 'mocha';

import { TokenList } from '../configs';
import BlockchainService from '../services/blockchains/blockchain';
import { IBlockchainService } from '../services/blockchains/domains';

const TokenErc20: Array<any> = [
  TokenList.ethereum.USDC,
  TokenList.ethereum.DAI,
  TokenList.ethereum.USDT,
  TokenList.arbitrum.USDT,
  TokenList.arbitrum.USDC,
  TokenList.arbitrum.DAI,
];

const service: IBlockchainService = new BlockchainService();

describe('blockchain service', async function () {
  describe('getTokenInfo', async function () {
    TokenErc20.map((item: any) =>
      it(`should get token ${item.chain}:${item.symbol} info correctly`, async function () {
        const token = await service.getTokenInfo({
          chain: item.chain,
          address: item.address,
          onchain: true,
        });
        expect(token).not.equal(null);
        if (token) {
          expect(token.address).equal(item.address);
          expect(token.symbol).equal(item.symbol);
          expect(token.decimals).equal(item.decimals);
        }
      }),
    );
  });
});
