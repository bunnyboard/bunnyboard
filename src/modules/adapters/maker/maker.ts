import BigNumber from 'bignumber.js';
import { decodeAbiParameters, decodeEventLog } from 'viem';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import AuthGemJoinAbi from '../../../configs/abi/maker/AuthGemJoin.json';
import DogAbi from '../../../configs/abi/maker/Dog.json';
import GemJoinAbi from '../../../configs/abi/maker/GemJoin.json';
import JugAbi from '../../../configs/abi/maker/Jug.json';
import PotAbi from '../../../configs/abi/maker/Pot.json';
import SpotAbi from '../../../configs/abi/maker/Spot.json';
import VatAbi from '../../../configs/abi/maker/Vat.json';
import { SolidityUnits, TimeUnits } from '../../../configs/constants';
import { MakerLendingMarketConfig } from '../../../configs/protocols/maker';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { CdpLendingAssetDataTimeframe } from '../../../types/domains/cdpLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import CdpLendingProtocolAdapter from '../cdpLending';
import { MakerEventSignatures } from './abis';

export default class MakerAdapter extends CdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.maker';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = MakerEventSignatures;
    this.abiConfigs.eventAbis = {
      gemJoin: GemJoinAbi,
      authGemJoin: AuthGemJoinAbi,
      vat: VatAbi,
      spot: SpotAbi,
      pot: PotAbi,
      jug: JugAbi,
      dog: DogAbi,
    };
  }

  public async getLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const { beginBlock, endBlock, stateTime, stateBlock, assetState } = await this.initialLendingAssetData(options);

    const marketConfig: MakerLendingMarketConfig = options.config as MakerLendingMarketConfig;

    const [vatDebt, jugBase] = await this.services.blockchain.multicall({
      chain: marketConfig.chain,
      calls: [
        {
          abi: this.abiConfigs.eventAbis.vat,
          target: marketConfig.vat,
          method: 'debt',
          params: [],
        },
        {
          abi: this.abiConfigs.eventAbis.jug,
          target: marketConfig.jug,
          method: 'base',
          params: [],
        },
      ],
      blockNumber: stateBlock,
    });

    assetState.totalBorrowed = formatBigNumberToString(vatDebt.toString(), SolidityUnits.RadDecimals);

    // https://docs.makerdao.com/smart-contract-modules/rates-module#a-note-on-setting-rates
    // const daiSavingRate = new BigNumber(1)
    //   .minus(
    //     new BigNumber(formatBigNumberToString(potDsr.toString(), SolidityUnits.RayDecimals)).pow(
    //       TimeUnits.SecondsPerYear,
    //     ),
    //   )
    //   .toString(10);
    // const daiSavingTvl = new BigNumber(potPie.toString())
    //   .multipliedBy(new BigNumber(potChi.toString()))
    //   .dividedBy(1e18)
    //   .dividedBy(1e27)
    //   .toString(10);

    const addresses: any = {};
    const transactions: any = {};

    // get DAI events, DAI join
    // count borrow/repay volumes
    const daiJoinLogs = await this.services.blockchain.getContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.daiJoin,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of daiJoinLogs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (
        signature === MakerEventSignatures.Join ||
        signature === MakerEventSignatures.PsmJoin ||
        signature === MakerEventSignatures.Exit
      ) {
        const rawAmount = decodeAbiParameters([{ type: 'uint256' }], log.topics[3])[0].toString();

        if (compareAddress(address, marketConfig.daiJoin)) {
          const user = normalizeAddress(decodeAbiParameters([{ type: 'address' }], log.topics[1])[0].toString());
          addresses[user] = true;
          transactions[log.transactionHash] = true;

          // borrow/repay DAI
          const amount = formatBigNumberToString(rawAmount, marketConfig.debtToken.decimals);
          if (signature === MakerEventSignatures.Join) {
            assetState.volumeRepaid = new BigNumber(assetState.volumeRepaid).plus(new BigNumber(amount)).toString(10);
          } else {
            assetState.volumeBorrowed = new BigNumber(assetState.volumeBorrowed)
              .plus(new BigNumber(amount))
              .toString(10);
          }
        }
      }
    }

    const liquidationLogs = await this.services.blockchain.getContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.dog,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const gemConfig of marketConfig.gems) {
      if (gemConfig.birthday <= stateTime) {
        const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: marketConfig.chain,
          address: gemConfig.collateralToken.address,
          timestamp: stateTime,
        });

        const gemBalance = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: Erc20Abi,
          target: gemConfig.collateralToken.address,
          method: 'balanceOf',
          params: [gemConfig.address],
          blockNumber: stateBlock,
        });

        if (collateralTokenPrice && gemBalance) {
          const [vatInfo, spotInfo, jugInfo] = await this.services.blockchain.multicall({
            chain: marketConfig.chain,
            blockNumber: stateBlock,
            calls: [
              {
                abi: this.abiConfigs.eventAbis.vat,
                target: marketConfig.vat,
                method: 'ilks',
                params: [gemConfig.ilk],
              },
              {
                abi: this.abiConfigs.eventAbis.spot,
                target: marketConfig.spot,
                method: 'ilks',
                params: [gemConfig.ilk],
              },
              {
                abi: this.abiConfigs.eventAbis.jug,
                target: marketConfig.jug,
                method: 'ilks',
                params: [gemConfig.ilk],
              },
            ],
          });

          const art = new BigNumber(vatInfo[0].toString());
          const rate = new BigNumber(vatInfo[1].toString());
          const spot = new BigNumber(spotInfo[1].toString());

          // spot is the collateral ratio borrowers must maintain to avoid liquidation
          // for example 145%
          // so, the loan to value = 100 % / 145% = 68.96%
          const loanToValue = new BigNumber(100)
            .multipliedBy(SolidityUnits.OneRay)
            .dividedBy(new BigNumber(spot))
            .dividedBy(100);
          const totalBorrowed = formatBigNumberToString(
            art.multipliedBy(rate).toString(10),
            SolidityUnits.RayDecimals + marketConfig.debtToken.decimals,
          );
          const totalDeposited = formatBigNumberToString(gemBalance.toString(), gemConfig.collateralToken.decimals);

          // https://docs.makerdao.com/smart-contract-modules/rates-module/jug-detailed-documentation
          const duty = new BigNumber(jugInfo[0].toString()).dividedBy(SolidityUnits.OneRay);
          const base = new BigNumber(jugBase.toString()).dividedBy(SolidityUnits.OneRay);
          const elapsed = 3600;

          const deltaRate = duty
            .plus(base)
            .pow(elapsed)
            .multipliedBy(rate.dividedBy(SolidityUnits.OneRay))
            .minus(rate.dividedBy(SolidityUnits.OneRay));

          const interestAmount = art.multipliedBy(deltaRate.multipliedBy(TimeUnits.SecondsPerYear).dividedBy(elapsed));

          const borrowRate = art.eq(0) ? new BigNumber(0) : interestAmount.dividedBy(art);

          let volumeDeposited = '0';
          let volumeWithdrawn = '0';
          let volumeLiquidated = '0';

          const gemLogs = await this.services.blockchain.getContractLogs({
            chain: marketConfig.chain,
            address: gemConfig.address,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });

          for (const log of gemLogs) {
            const signature = log.topics[0];
            const address = normalizeAddress(log.address);

            if (
              signature === MakerEventSignatures.Join ||
              signature === MakerEventSignatures.PsmJoin ||
              signature === MakerEventSignatures.Exit
            ) {
              if (compareAddress(address, gemConfig.address)) {
                const user = normalizeAddress(decodeAbiParameters([{ type: 'address' }], log.topics[1])[0].toString());
                addresses[user] = true;
                transactions[log.transactionHash] = true;

                const rawAmount = decodeAbiParameters([{ type: 'uint256' }], log.topics[3])[0].toString();
                const amount = formatBigNumberToString(rawAmount, gemConfig.collateralToken.decimals);
                if (signature === MakerEventSignatures.Exit) {
                  // withdraw
                  volumeWithdrawn = new BigNumber(volumeWithdrawn).plus(new BigNumber(amount)).toString(10);
                } else {
                  volumeDeposited = new BigNumber(volumeDeposited).plus(new BigNumber(amount)).toString(10);
                }
              }
            } else if (signature === MakerEventSignatures.AuthJoin || signature === MakerEventSignatures.AuthExit) {
              if (compareAddress(address, gemConfig.address)) {
                const event: any = decodeEventLog({
                  abi: this.abiConfigs.eventAbis.authGemJoin,
                  data: log.data,
                  topics: log.topics,
                });

                const user = normalizeAddress(event.args.urn);
                addresses[user] = true;
                transactions[log.transactionHash] = true;

                const amount = formatBigNumberToString(event.args.amt.toString(), gemConfig.collateralToken.decimals);

                if (signature === MakerEventSignatures.AuthJoin) {
                  // deposit
                  volumeDeposited = new BigNumber(volumeDeposited).plus(new BigNumber(amount)).toString(10);
                } else {
                  volumeWithdrawn = new BigNumber(volumeWithdrawn).plus(new BigNumber(amount)).toString(10);
                }
              }
            }
          }

          for (const log of liquidationLogs) {
            const signature = log.topics[0];

            if (signature === MakerEventSignatures.Bark) {
              // liquidation
              // https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation
              // https://etherscan.io/tx/0x01c4e90a4c080a3d496030a8038f2c50d92de569ebc31866e28a575e37cb3da5#eventlog
              const event: any = decodeEventLog({
                abi: this.abiConfigs.eventAbis.dog,
                data: log.data,
                topics: log.topics,
              });

              if (event.args.ilk === gemConfig.ilk) {
                addresses[normalizeAddress(event.args.urn)] = true;
                transactions[log.transactionHash] = true;

                volumeLiquidated = new BigNumber(volumeLiquidated)
                  .plus(new BigNumber(formatBigNumberToString(event.args.ink.toString(), 18)))
                  .toString(10);
              }
            }
          }

          assetState.collaterals.push({
            token: gemConfig.collateralToken,
            tokenPrice: collateralTokenPrice ? collateralTokenPrice : '',
            address: gemConfig.address,
            totalDeposited: totalDeposited,
            totalBorrowed: totalBorrowed,
            rateBorrow: borrowRate.toString(10),
            rateLoanToValue: loanToValue.toString(10),
            volumeDeposited: volumeDeposited,
            volumeLiquidated: volumeWithdrawn,
            volumeWithdrawn: volumeLiquidated,

            // no opening fees on Maker
            rateBorrowOpeningFee: '0',
          });

          assetState.feesPaid = new BigNumber(assetState.feesPaid)
            .plus(new BigNumber(totalBorrowed).multipliedBy(borrowRate.toString(10)))
            .toString(10);
        }
      }
    }

    assetState.addresses = Object.keys(addresses);
    assetState.transactions = Object.keys(transactions);

    return assetState;
  }
}
