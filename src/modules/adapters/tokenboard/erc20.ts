import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import { AddressZero, Erc20TransferEventSignature } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { GetAdapterDataStateOptions, GetAdapterDataTimeframeOptions } from '../../../types/collectors/options';
import { TokenBoardErc20DataState, TokenBoardErc20DataTimeframe } from '../../../types/collectors/tokenBoard';
import { TokenBoardErc20Config } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import ProtocolAdapter from '../adapter';

export default class TokenBoardErc20Adapter extends ProtocolAdapter {
  public readonly name: string = 'board.erc20';

  constructor(services: ContextServices) {
    super(services);
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<TokenBoardErc20DataState | null> {
    const erc20Config = options.config as TokenBoardErc20Config;

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const dataState: TokenBoardErc20DataState = {
      chain: erc20Config.chain,
      protocol: erc20Config.protocol,
      metric: erc20Config.metric,
      address: erc20Config.address,
      symbol: erc20Config.symbol,
      decimals: erc20Config.decimals,
      stablecoin: erc20Config.stablecoin,
      tokenPrice: '0',
      totalSupply: '0',
      timestamp: options.timestamp,
    };

    const tokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: erc20Config.chain,
      address: erc20Config.address,
      timestamp: options.timestamp,
    });

    if (tokenPrice) {
      dataState.tokenPrice = tokenPrice;
    }

    const totalSupply = await this.services.blockchain.readContract({
      chain: erc20Config.chain,
      abi: Erc20Abi,
      target: erc20Config.address,
      method: 'totalSupply',
      params: [],
      blockNumber,
    });

    dataState.totalSupply = formatBigNumberToString(totalSupply.toString(), erc20Config.decimals);

    return dataState;
  }

  public async getDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<TokenBoardErc20DataTimeframe | null> {
    const dataState = await this.getDataState({
      config: options.config,
      timestamp: options.fromTime,
    });
    if (!dataState) {
      return null;
    }

    const beginBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.fromTime,
    );
    const endBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.toTime,
    );

    const logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    let volumeTransfer = new BigNumber(0);
    let volumeMint = new BigNumber(0);
    let volumeBurn = new BigNumber(0);
    for (const log of logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (signature === Erc20TransferEventSignature && compareAddress(address, dataState.address)) {
        const event: any = decodeEventLog({
          abi: Erc20Abi,
          data: log.data,
          topics: log.topics,
        });

        const amount = formatBigNumberToString(event.args.value.toString(), dataState.decimals);
        const sender = normalizeAddress(event.args.from);
        const recipient = normalizeAddress(event.args.to);

        if (amount !== '0') {
          volumeTransfer = volumeTransfer.plus(new BigNumber(amount));

          if (compareAddress(sender, AddressZero)) {
            volumeMint = volumeMint.plus(new BigNumber(amount));
          }

          if (compareAddress(recipient, AddressZero)) {
            volumeBurn = volumeBurn.plus(new BigNumber(amount));
          }
        }
      }
    }

    return {
      ...dataState,

      timefrom: options.fromTime,
      timeto: options.toTime,
      volumeTransfer: volumeTransfer.toString(10),
      volumeMint: volumeMint.toString(10),
      volumeBurn: volumeBurn.toString(10),
    };
  }
}
