import AggregatorAbi from '../../configs/abi/chainlink/EACAggregator.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceChainlink } from '../../types/oracles';

export default class ChainlinkLibs {
  public static async getPriceFromAggregator(
    config: OracleSourceChainlink,
    blockNumber: number,
  ): Promise<string | null> {
    const blockchain = new BlockchainService();
    const latestAnswer = await blockchain.readContract({
      chain: config.chain,
      abi: AggregatorAbi,
      target: config.address,
      method: 'latestAnswer',
      params: [],
      blockNumber,
    });

    return latestAnswer ? formatBigNumberToString(latestAnswer.toString(), config.decimals) : null;
  }
}
