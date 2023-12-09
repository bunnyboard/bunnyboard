import { LiquidityPoolConfig } from './configs';

export interface StaticDataMasterchefPoolInfo {
  chain: string;
  protocol: string;
  poolId: number;
  address: string; // masterchef address
  lpToken: LiquidityPoolConfig;
}
