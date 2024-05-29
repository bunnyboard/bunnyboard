import fs from 'fs';

import AjnaErc20FactoryAbi from '../configs/abi/ajna/ERC20Factory.json';
import AjnaErc20PoolAbi from '../configs/abi/ajna/ERC20Pool.json';
import { AjnaConfigs } from '../configs/protocols/ajna';
import { normalizeAddress } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';

const tokenlistPath = './src/configs/data/tokenlists';

(async function () {
  const blockchain = new BlockchainService();

  // Ajna have isolated lending pool
  // that have quote and collateral tokens
  // we need update these tokens into token lists
  // Ajna pool list can be get from Ajna pool factory contract
  for (const config of AjnaConfigs.configs) {
    let existedTokens: any = {};
    if (fs.existsSync(`${tokenlistPath}/${config.chain}.json`)) {
      existedTokens = JSON.parse(fs.readFileSync(`${tokenlistPath}/${config.chain}.json`).toString());
    }

    const deployedPools = await blockchain.readContract({
      chain: config.chain,
      abi: AjnaErc20FactoryAbi,
      target: config.address,
      method: 'getDeployedPoolsList',
      params: [],
    });
    for (const poolAddress of deployedPools) {
      if (config.whitelistedPools.indexOf(normalizeAddress(poolAddress)) === -1) {
        continue;
      }

      const [collateralAddress, quoteTokenAddress] = await blockchain.multicall({
        chain: config.chain,
        calls: [
          {
            abi: AjnaErc20PoolAbi,
            target: poolAddress,
            method: 'collateralAddress',
            params: [],
          },
          {
            abi: AjnaErc20PoolAbi,
            target: poolAddress,
            method: 'quoteTokenAddress',
            params: [],
          },
        ],
      });

      const quoteToken = await blockchain.getTokenInfo({
        chain: config.chain,
        address: quoteTokenAddress,
      });
      const collateralToken = await blockchain.getTokenInfo({
        chain: config.chain,
        address: collateralAddress,
      });
      if (quoteToken) {
        if (!existedTokens[quoteToken.address]) {
          console.log('found new token', quoteToken);
        }

        existedTokens[quoteToken.address] = quoteToken;
      }
      if (collateralToken) {
        if (!existedTokens[collateralToken.address]) {
          console.log('found new token', collateralToken);
        }

        existedTokens[collateralToken.address] = collateralToken;
      }
    }

    fs.writeFileSync(`${tokenlistPath}/${config.chain}.json`, JSON.stringify(existedTokens));
  }
})();
