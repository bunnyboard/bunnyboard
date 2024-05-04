import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import BeaconDepositAbi from '../../../configs/abi/BeaconDeposit.json';
import L1StandardBridgeAbi from '../../../configs/abi/optimism/L1StandardBridge.json';
import {
  EthereumEcosystemConfig,
  EthereumEcosystemConfigs,
  EthereumLayer2Config,
} from '../../../configs/boards/ethereum';
import { AddressZero } from '../../../configs/constants';
import { formatBigNumberToString, formatLittleEndian64ToString } from '../../../lib/utils';
import { DataMetrics } from '../../../types/configs';
import { ChainBoardDataTimeframe } from '../../../types/domains/chainBoard';
import { EthereumEcosystemDataTimeframe, EthereumLayer2Metrics } from '../../../types/domains/ethereum';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ChainBoardAdapter from '../chainBoard';
import { EthereumEcosystemEvents } from './abis';
import EvmChainAdapter from './evm';

export interface IEthereumEcosystemAdapter {
  name: string;

  services: ContextServices;
  storages: ContextStorages;
}

interface GetDataTimeframeOptions {
  fromTime: number;
  toTime: number;
  debug?: boolean;
}

export interface RunEthereumEcosystemAdapterProps {
  fromBlock: number;
  force: boolean;
}

export default class EthereumEcosystemAdapter implements IEthereumEcosystemAdapter {
  public readonly name: string = 'ethereum';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  private readonly adapter: ChainBoardAdapter;
  private readonly config: EthereumEcosystemConfig;
  // private readonly executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages) {
    this.services = services;
    this.storages = storages;

    this.adapter = new EvmChainAdapter(services, storages);
    this.config = EthereumEcosystemConfigs;
  }

  public async getEthereumChainStats(options: GetDataTimeframeOptions): Promise<ChainBoardDataTimeframe | null> {
    return await this.adapter.getDataTimeframe({
      config: {
        chain: this.config.chain,
        metric: DataMetrics.chainBoard,
        birthday: this.config.birthday,
      },
      fromTime: options.fromTime,
      toTime: options.toTime,
      debug: options.debug,
    });
  }

  public async getEthereumLayer2Stats(
    options: GetDataTimeframeOptions,
    layer2Config: EthereumLayer2Config,
  ): Promise<EthereumLayer2Metrics> {
    const fromBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(this.config.chain, options.fromTime);
    const toBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(this.config.chain, options.toTime);

    const layer2Data: EthereumLayer2Metrics = {
      chain: layer2Config.chain,
      bridgeTotalDeposited: '0',
      bridgeVolumeDeposit: '0',
      bridgeVolumeWithdraw: '0',
    };

    if (layer2Config.type === 'opstack') {
      const client = this.services.blockchain.getPublicClient(this.config.chain);
      const ethBalance = await client.getBalance({
        address: layer2Config.portalAddress as any,
        blockNumber: BigInt(fromBlock),
      });
      if (ethBalance) {
        layer2Data.bridgeTotalDeposited = formatBigNumberToString(ethBalance.toString(), 18);
      }
    }

    const bridgeContractLogs = await this.services.blockchain.getContractLogs({
      chain: this.config.chain, // on ethereum
      address: layer2Config.bridgeAddress,
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    for (const log of bridgeContractLogs) {
      const signature = log.topics[0];
      if (
        layer2Config.type === 'opstack' &&
        (signature === EthereumEcosystemEvents.OpStackBridgeDeposit ||
          signature === EthereumEcosystemEvents.OpStackBridgeWithdraw)
      ) {
        const event: any = decodeEventLog({
          abi: L1StandardBridgeAbi,
          data: log.data,
          topics: log.topics,
        });
        if (signature === EthereumEcosystemEvents.OpStackBridgeDeposit) {
          layer2Data.bridgeVolumeDeposit = new BigNumber(layer2Data.bridgeVolumeDeposit)
            .plus(new BigNumber(formatBigNumberToString(event.args.amount.toString(), 18)))
            .toString(10);
        } else if (EthereumEcosystemEvents.OpStackBridgeWithdraw) {
          layer2Data.bridgeVolumeWithdraw = new BigNumber(layer2Data.bridgeVolumeWithdraw)
            .plus(new BigNumber(formatBigNumberToString(event.args.amount.toString(), 18)))
            .toString(10);
        }
      }
    }

    return layer2Data;
  }

  public async getEcosystemSnapshot(options: GetDataTimeframeOptions): Promise<EthereumEcosystemDataTimeframe | null> {
    const fromBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(this.config.chain, options.fromTime);
    const toBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(this.config.chain, options.toTime);

    const chainBoardDataTimeframe = await this.getEthereumChainStats(options);
    if (chainBoardDataTimeframe) {
      const logs = await this.services.blockchain.getContractLogs({
        chain: this.config.chain,
        address: this.config.beaconDepositContract,
        fromBlock,
        toBlock,
      });

      let volumeDeposited = new BigNumber(0);
      for (const log of logs) {
        if (log.topics[0] === EthereumEcosystemEvents.BeaconDeposit) {
          const event: any = decodeEventLog({
            abi: BeaconDepositAbi,
            data: log.data,
            topics: log.topics,
          });
          volumeDeposited = volumeDeposited.plus(
            new BigNumber(formatLittleEndian64ToString(event.args.amount.toString())),
          );
        }
      }

      const layer2: Array<EthereumLayer2Metrics> = [];
      for (const layer2Config of this.config.layer2) {
        layer2.push(await this.getEthereumLayer2Stats(options, layer2Config));
      }

      const coinPrice = await this.services.oracle.getTokenPriceUsd({
        chain: this.config.chain,
        address: AddressZero,
        timestamp: options.fromTime,
      });

      return {
        ...chainBoardDataTimeframe,
        coinPrice: coinPrice ? coinPrice : '0',
        volumeCoinDeposited: volumeDeposited.toString(10),
        layer2: layer2,
      };
    }

    return null;
  }
}
