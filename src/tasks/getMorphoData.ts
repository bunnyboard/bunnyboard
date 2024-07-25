// help to Morpho Blue markets data
import * as fs from 'fs';
import { decodeEventLog } from 'viem';

import MorphoBlueAbi from '../configs/abi/morpho/MorphoBlue.json';
import { TimeUnits } from '../configs/constants';
import { getStartDayTimestamp, normalizeAddress } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';
import { Token } from '../types/configs';

const dataPath = './src/configs/data/statics/MorphoBlueMarkets.json';

interface MorphoMarket {
  chain: string;
  morphoBlue: string;
  marketId: string; // bytes32
  debtToken: Token;
  collateral: Token;
  oracle: string;
  irm: string;
  ltv: string;
  birthday: number;
  birthblock: number;
}

const configs: Array<string> = [
  'ethereum:0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
  'base:0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
];

const blockchain = new BlockchainService();

function getBirthBlock(chain: string, mappings: any) {
  if (mappings) {
    let latestBlock = 0;
    for (const market of Object.values(mappings)) {
      if ((market as any).chain === chain && (market as any).birthblock > latestBlock) {
        latestBlock = (market as any).birthblock;
      }
    }
    return latestBlock;
  } else {
    if (chain === 'ethereum') {
      // ethereum
      return 18883124;
    } else {
      // base
      return 13977148;
    }
  }
}

(async function () {
  // marketId => underlying token
  let mappings: { [key: string]: MorphoMarket } = {};
  try {
    mappings = JSON.parse(fs.readFileSync(dataPath).toString());
  } catch (e: any) {}

  for (const config of configs) {
    const [chain, address] = config.split(':');
    const birthblock = getBirthBlock(chain, mappings);

    console.log('start getting markets data', chain, address, birthblock);

    const publiClient = blockchain.getPublicClient(chain);
    const latestBlock = Number(await publiClient.getBlockNumber());

    const blockRange = 1000;
    let startBlock = Number(birthblock);

    while (startBlock < latestBlock) {
      const toBlock = startBlock + blockRange > latestBlock ? latestBlock : startBlock + blockRange;
      const logs = await blockchain.getContractLogs({
        chain: chain,
        address: address,
        fromBlock: startBlock,
        toBlock: toBlock,
      });

      for (const log of logs) {
        const signature = log.topics[0];
        if (signature === '0xac4b2400f169220b0c0afdde7a0b32e775ba727ea1cb30b35f935cdaab8683ac') {
          const event: any = decodeEventLog({
            abi: MorphoBlueAbi,
            topics: log.topics,
            data: log.data,
          });

          const block = await publiClient.getBlock({
            blockNumber: BigInt(log.blockNumber),
          });
          const birthday = getStartDayTimestamp(Number(block.timestamp) + TimeUnits.SecondsPerDay);

          const marketId = event.args.id;
          const debtToken = await blockchain.getTokenInfo({
            chain: chain,
            address: event.args.marketParams.loanToken.toString(),
          });
          const collateral = await blockchain.getTokenInfo({
            chain: chain,
            address: event.args.marketParams.collateralToken.toString(),
          });
          if (debtToken && collateral) {
            mappings[marketId] = {
              chain: chain,
              morphoBlue: normalizeAddress(address),
              marketId: marketId,
              debtToken: debtToken,
              collateral: collateral,
              oracle: normalizeAddress(event.args.marketParams.oracle.toString()),
              irm: normalizeAddress(event.args.marketParams.irm.toString()),
              ltv: event.args.marketParams.lltv.toString(),
              birthblock: Number(log.blockNumber),
              birthday: birthday,
            };
          }
        }
      }

      startBlock += blockRange;

      console.log(`got market info ${chain} ${address} ${startBlock}`);
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(mappings).toString());

  process.exit(0);
})();
