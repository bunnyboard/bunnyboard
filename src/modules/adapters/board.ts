import { TokenBoardErc20DataState, TokenBoardErc20DataTimeframe } from '../../types/collectors/tokenboard';
import { BoardConfig, MetricConfig } from '../../types/configs';
import { ContextServices, IBoardAdapter } from '../../types/namespaces';

export default class BoardAdapter implements IBoardAdapter {
  public readonly name: string = 'board';
  public readonly services: ContextServices;
  public readonly config: BoardConfig;

  constructor(services: ContextServices, config: BoardConfig) {
    this.services = services;
    this.config = config;
  }

  public async getDataState(config: MetricConfig, timestamp: number): Promise<TokenBoardErc20DataState | null> {
    return null;
  }

  public async getDataTimeframe(
    config: MetricConfig,
    fromTime: number,
    toTime: number,
  ): Promise<TokenBoardErc20DataTimeframe | null> {
    return null;
  }
}
