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
  'ethereum:18883124:0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
  'base:13977148:0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
];

const blockchain = new BlockchainService();

(async function () {
  // marketId => underlying token
  const mappings: { [key: string]: MorphoMarket } = {};

  for (const config of configs) {
    const [chain, birthblock, address] = config.split(':');

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
