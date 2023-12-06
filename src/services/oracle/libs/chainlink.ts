import AggregatorAbi from '../../../configs/abi/chainlink/EACAggregator.json';
import { formatFromDecimals } from '../../../lib/utils';
import { OracleSourceChainlink } from '../../../types/configs';
import BlockchainService from '../../blockchains/blockchain';

export default class ChainlinkLibs {
  public static async getPriceFromAggregator(
    config: OracleSourceChainlink,
    blockNumber: number,
  ): Promise<string | null> {
    const blockchain = new BlockchainService();
    const latestAnswer = await blockchain.singlecall({
      chain: config.chain,
      abi: AggregatorAbi,
      target: config.address,
      method: 'latestAnswer',
      params: [],
      blockNumber,
    });

    return latestAnswer ? formatFromDecimals(latestAnswer.toString(), config.decimals) : null;
  }
}