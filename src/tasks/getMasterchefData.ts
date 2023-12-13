// help to get static data from given masterchef contracts
import * as fs from 'fs';

import MasterchefAbi from '../configs/abi/sushi/Masterchef.json';
import { compareAddress, normalizeAddress } from '../lib/utils';
import UniswapLibs from '../modules/libs/uniswap';
import BlockchainService from '../services/blockchains/blockchain';
import { StaticDataMasterchefPoolInfo } from '../types/others';

interface Masterchef {
  chain: string;
  protocol: string;
  address: string;
}

const contracts: Array<Masterchef> = [
  {
    chain: 'ethereum',
    protocol: 'sushi',
    address: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
  },
];

const directoryPath = './src/configs/data';

(async function () {
  const blockchain = new BlockchainService();

  let pools: Array<StaticDataMasterchefPoolInfo> = [];
  if (fs.existsSync(`${directoryPath}/MasterchefPools.json`)) {
    pools = JSON.parse(fs.readFileSync(`${directoryPath}/MasterchefPools.json`).toString());
  }

  for (const contract of contracts) {
    const poolLength = await blockchain.singlecall({
      chain: contract.chain,
      target: contract.address,
      abi: MasterchefAbi,
      method: 'poolLength',
      params: [],
    });

    for (let poolId = 0; poolId < Number(poolLength); poolId++) {
      if (
        pools.filter((item) => compareAddress(item.address, contract.address) && item.poolId === poolId).length === 0
      ) {
        const poolInfo = await blockchain.singlecall({
          chain: contract.chain,
          target: contract.address,
          abi: MasterchefAbi,
          method: 'poolInfo',
          params: [poolId],
        });
        const liquidityPool = await UniswapLibs.getPool2Constant(contract.chain, poolInfo.lpToken);
        if (liquidityPool) {
          pools.push({
            chain: contract.chain,
            address: normalizeAddress(contract.address),
            protocol: contract.protocol,
            poolId: poolId,
            lpToken: liquidityPool,
          });
        }

        console.log(
          `Got masterchef pool ${contract.chain} ${contract.protocol} ${contract.address} ${poolId} ${
            liquidityPool
              ? liquidityPool.tokens.length > 0
                ? `${liquidityPool.tokens[0].symbol}-${liquidityPool.tokens[1].symbol}`
                : `${liquidityPool.symbol}`
              : 'None'
          }`,
        );

        fs.writeFileSync(`${directoryPath}/MasterchefPools.json`, JSON.stringify(pools));
      }
    }
  }

  process.exit(0);
})();
