import axios from 'axios';

import logger from './logger';
import { sleep } from './utils';

async function querySubgraph(endpoint: string, query: string, options: any = {}): Promise<any> {
  try {
    const response = await axios.post(
      endpoint,
      {
        query: query,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...options,
        },
        validateStatus: (status: number) => true,
      },
    );

    if (response.data.errors) {
      logger.warn('failed to query subgraph', {
        service: 'subgraph',
        endpoint: endpoint,
      });
      console.error(response.data.errors);
      return null;
    }

    return response.data.data ? response.data.data : null;
  } catch (e: any) {
    logger.warn('failed to query subgraph', {
      service: 'subgraph',
      endpoint: endpoint,
      error: e.message,
    });
    return null;
  }
}

async function queryBlockNumberAtTimestamp(endpoint: string, timestamp: number): Promise<number> {
  const response = await querySubgraph(
    endpoint,
    `
      {
        blocks(first: 1, where: {timestamp_lte: ${timestamp}}, orderBy: timestamp, orderDirection: desc) {
          number
        }
      }
    `,
  );

  if (response && response.blocks.length > 0) {
    return Number(response.blocks[0].number);
  }

  return 0;
}

export async function tryQueryBlockNumberAtTimestamp(endpoint: string, timestamp: number): Promise<number> {
  let blockNumber = 0;

  do {
    blockNumber = await queryBlockNumberAtTimestamp(endpoint, timestamp);
    if (blockNumber === 0) {
      logger.warn('failed to query block number at timestamp', {
        service: 'subgraph',
        endpoint: endpoint,
        time: timestamp,
      });
      await sleep(10);
    }
  } while (blockNumber === 0);

  return blockNumber;
}

export interface BlockTimestamps {
  [key: number]: number;
}

export async function tryQueryBlockTimestamps(
  endpoint: string,
  fromBlock: number,
  toBlock: number,
): Promise<BlockTimestamps> {
  const blockTimestamps: BlockTimestamps = {};

  let startBlock = fromBlock;
  const endBlock = toBlock;

  const queryLimit = 1000;
  while (startBlock <= endBlock) {
    const response = await querySubgraph(
      endpoint,
      `
        {
          blocks(first: ${queryLimit}, where: {number_gte: ${startBlock}}, orderBy: number, orderDirection: asc) {
            number
            timestamp
          }
        }
      `,
    );
    if (response) {
      for (const block of response.blocks) {
        blockTimestamps[Number(block.number)] = Number(Number(block.timestamp));
      }
    }

    startBlock += queryLimit;
  }

  return blockTimestamps;
}
