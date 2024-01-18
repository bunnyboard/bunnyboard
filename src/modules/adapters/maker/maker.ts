import BigNumber from 'bignumber.js';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import GemJoinAbi from '../../../configs/abi/maker/GemJoin.json';
import JugAbi from '../../../configs/abi/maker/Jug.json';
import SpotAbi from '../../../configs/abi/maker/Spot.json';
import VatAbi from '../../../configs/abi/maker/Vat.json';
import { ONE_RAY, RAY_DECIMALS, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { MakerLendingMarketConfig } from '../../../configs/protocols/maker';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { DataMetrics, ProtocolConfig, Token } from '../../../types/configs';
import { LendingMarketState } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetAdapterDataOptions, GetStateDataResult } from '../../../types/options';
import ProtocolAdapter from '../adapter';

export default class MakerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.maker';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    const result: GetStateDataResult = {
      data: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig: MakerLendingMarketConfig = options.config as MakerLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;

    const gem = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: GemJoinAbi,
      target: marketConfig.address,
      method: 'gem',
      params: [],
    });
    const ilk = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: GemJoinAbi,
      target: marketConfig.address,
      method: 'ilk',
      params: [],
    });

    const collateralToken = await this.services.blockchain.getTokenInfo({
      chain: marketConfig.chain,
      address: gem,
    });
    if (collateralToken) {
      const gemBalance = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: Erc20Abi,
        target: collateralToken.address,
        method: 'balanceOf',
        params: [marketConfig.address],
        blockNumber: blockNumber,
      });
      const vatInfo = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: VatAbi,
        target: marketConfig.vat,
        method: 'ilks',
        params: [ilk],
        blockNumber: blockNumber,
      });
      const spotInfo = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: SpotAbi,
        target: marketConfig.spot,
        method: 'ilks',
        params: [ilk],
        blockNumber: blockNumber,
      });
      const jugInfo = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: JugAbi,
        target: marketConfig.jug,
        method: 'ilks',
        params: [ilk],
        blockNumber: blockNumber,
      });
      const jugBase = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: JugAbi,
        target: marketConfig.jug,
        method: 'base',
        params: [],
        blockNumber: blockNumber,
      });

      const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: marketConfig.chain,
        address: debtToken.address,
        timestamp: options.timestamp,
      });
      const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: marketConfig.chain,
        address: collateralToken.address,
        timestamp: options.timestamp,
      });

      const art = new BigNumber(vatInfo[0].toString());
      const rate = new BigNumber(vatInfo[1].toString());
      const spot = new BigNumber(spotInfo[1].toString());

      // spot is the collateral ratio borrowers must maintain to avoid liquidation
      // for example 145%
      // so, the loan to value = 100 % / 145% = 68.96%
      const loanToValue = new BigNumber(100).multipliedBy(ONE_RAY).dividedBy(new BigNumber(spot));
      const totalBorrowed = formatBigNumberToString(
        art.multipliedBy(rate).toString(10),
        RAY_DECIMALS + debtToken.decimals,
      );
      const totalDeposited = formatBigNumberToString(gemBalance.toString(), collateralToken.decimals);

      // https://docs.makerdao.com/smart-contract-modules/rates-module/jug-detailed-documentation
      const duty = new BigNumber(jugInfo[0].toString()).dividedBy(ONE_RAY);
      const base = new BigNumber(jugBase.toString()).dividedBy(ONE_RAY);
      const elapsed = 3600;

      const deltaRate = duty
        .plus(base)
        .pow(elapsed)
        .multipliedBy(rate.dividedBy(ONE_RAY))
        .minus(rate.dividedBy(ONE_RAY));

      const interestAmount = art.multipliedBy(deltaRate.multipliedBy(YEAR).dividedBy(elapsed));

      const borrowRate = art.eq(0) ? new BigNumber(0) : interestAmount.dividedBy(art);

      const dataState: LendingMarketState = {
        type: marketConfig.type,
        metric: DataMetrics.lending,
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: debtToken,
        tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
        collateralToken: collateralToken,
        collateralTokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',

        totalDeposited: totalDeposited,
        totalBorrowed: totalBorrowed,

        supplyRate: '0',
        borrowRate: borrowRate.toString(10),

        loanToValueRate: loanToValue.toString(10),
      };

      result.data.push(dataState);
    }

    return result;
  }
}
