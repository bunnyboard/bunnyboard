import AjnaErc20FactoryAbi from '../configs/abi/ajna/ERC20Factory.json';
import AjnaErc20PoolAbi from '../configs/abi/ajna/ERC20Pool.json';
import BlockchainService from '../services/blockchains/blockchain';
import { Token } from '../types/configs';
import updateTokenInfo from './helpers/updateTokenInfo';

const configs: Array<string> = [
  // chain:poolFactory
  'ethereum:0x6146dd43c5622bb6d12a5240ab9cf4de14edc625',
  'base:0x214f62b5836d83f3d6c4f71f174209097b1a779c',
  'polygon:0x1f172f881eba06aa7a991651780527c173783cf6',
  'arbitrum:0xA3A1e968Bd6C578205E11256c8e6929f21742aAF',
  'blast:0xcfCB7fb8c13c7bEffC619c3413Ad349Cbc6D5c91',
  'gnosis:0x87578E357358163FCAb1711c62AcDB5BBFa1C9ef',
  'linea:0xd72A448C3BC8f47EAfFc2C88Cf9aC9423Bfb5067',
  'mode:0x62Cf5d9075D1d6540A6c7Fa836162F01a264115A',
  'optimism:0x609C4e8804fafC07c96bE81A8a98d0AdCf2b7Dfa',
];

const blockchain = new BlockchainService();

(async function () {
  // Ajna have isolated lending pool
  // that have quote and collateral tokens
  // we get static data from every pools
  const tokens: Array<Token> = [];

  for (const config of configs) {
    const [chain, factoryAddress] = config.split(':');

    const deployedPools = await blockchain.readContract({
      chain: chain,
      abi: AjnaErc20FactoryAbi,
      target: factoryAddress,
      method: 'getDeployedPoolsList',
      params: [],
    });

    for (const poolAddress of deployedPools) {
      const [collateralAddress, quoteTokenAddress] = await blockchain.multicall({
        chain: chain,
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

      const debtToken = await blockchain.getTokenInfo({
        chain: chain,
        address: quoteTokenAddress,
      });
      const collateralToken = await blockchain.getTokenInfo({
        chain: chain,
        address: collateralAddress,
      });

      if (debtToken && collateralToken) {
        tokens.push(debtToken);
        tokens.push(collateralToken);
      }
    }

    // update token metadata
    updateTokenInfo(tokens);
  }
})();
