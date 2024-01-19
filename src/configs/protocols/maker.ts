import { normalizeAddress } from '../../lib/utils';
import {
  Contract,
  DataMetrics,
  LendingMarketConfig,
  LendingMarketTypes,
  LendingMarketVersions,
  ProtocolConfig,
} from '../../types/configs';
import EthereumTokenList from '../tokenlists/ethereum.json';

export interface MakerLendingMarketConfig extends LendingMarketConfig {
  daiJoin: string;
  vat: string;
  spot: string;
  jug: string;
}

export interface MakerProtocolConfig extends ProtocolConfig {
  configs: Array<MakerLendingMarketConfig>;
  daiJoin: Contract;
}

function formatMakerConfigs(configs: Array<MakerLendingMarketConfig>): Array<MakerLendingMarketConfig> {
  return configs.map((item) => {
    return {
      ...item,
      address: normalizeAddress(item.address),
      daiJoin: normalizeAddress(item.daiJoin),
      vat: normalizeAddress(item.vat),
      spot: normalizeAddress(item.spot),
      jug: normalizeAddress(item.jug),
    };
  });
}

const MakerDaiJoinContract = '0x9759a6ac90977b93b58547b4a71c78317f391a28';
const MakerVatContract = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b';
const MakerSpotContract = '0x65c79fcb50ca1594b025960e539ed7a9a6d434a3';
const MakerJugContract = '0x19c0976f590d67707e62397c87829d896dc0f1f1';

const MakerGemJoins: Array<string> = [
  // timestamp:address:collateral
  '1573689600:0x2F0b23f53734252Bda2277357e97e1517d6B042A:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH-A
  '1602633600:0x08638eF1A205bE6762A8b935F5da9b700Cf7322c:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH-B
  '1615507200:0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH-C
  '1634428800:0x10CD5fbe1b404B7E19Ef964B63939907bdaf42E2:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH-A
  '1651190400:0x248cCBf4864221fC0E840F29BB042ad5bFC89B5c:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH-B
  '1667001600:0xC6424e862f1462281B0a5FAc078e4b63006bDEBF:0xae78736cd615f374d3085123a210448e74fc6393', // RETH-A
  '1599177600:0x7e62B7E279DFC78DEB656E34D6a435cC08a44666:0x8e870d67f660d95d5be530380d0ec0bd388289e1', // PAXUSD-A
  '1584403200:0xA191e578a6736167326d05c119CE0c90849E84B7:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC-A
  '1590624000:0x2600004fd1585f7270756DDc88aD9cfA10dD0428:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC-B
  '1588291200:0xBF72Da2Bd84c5170618Fbe5914B0ECA9638d5eb5:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC-A
  '1637193600:0xfA8c996e158B80D77FbD0082BB437556A65B96E0:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC-B
  '1637798400:0x7f62f9592b823331E012D3c5DdF2A7714CfB9de2:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC-C
  '1605225600:0xe29A14bcDeA40d83675aa43B72dF07f649738C8b:0x056fd409e1d7a124bd7017459dfea2f387b6d5cd', // GUSD-A

  '1608336000:0x0A59649758aa4d66E25f08Dd01271e891fe52199:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // PSM USDC-A
  '1629417600:0x7bbd8cA5e413bCa521C2c80D8d1908616894Cf21:0x8e870d67f660d95d5be530380d0ec0bd388289e1', // PSM USDP-A
  '1637884800:0x79A0FA989fb7ADf1F8e80C93ee605Ebb94F7c6A5:0x056fd409e1d7a124bd7017459dfea2f387b6d5cd', // PSM GUSD-A

  // '1590624000:0x4454aF7C8bb9463203b66C816220D41ED7837f44', // TUSD-A
  // '1599177600:0x0Ac6A1D74E84C2dF9063bDDc31699FF2a2BB22A2', // USDT-A
  // '1573689600:0x3D0B1912B66114d4096F48A8CEe3A56C231772cA', // BAT-A
  // '1601078400:0xBEa7cDfB4b49EC154Ae1c0D731E4DC773A3265aA', // COMP-A
  // '1592956800:0x475F1a89C1ED844A08E8f6C50A00228b5E59E4A9', // KNC-A
  // '1601078400:0xdFccAf8fDbD2F4805C174f856a317765B49E4a50', // LINK-A
  // '1601078400:0x6C186404A7A238D3d6027C0299D1822c1cf5d8f1', // LRC-A
  // '1595376000:0xa6ea3b9c04b8a38ff5e224e7c3d6937ca44c0ef9', // MANA-A
  // '1592956800:0xc7e8Cd72BDEe38865b4F5615956eF47ce1a7e5D0', // ZRX-A
  // '1604620800:0x4a03Aa7fb3973d8f0221B466EefB53D0aC195f55', // BAL-A
];

export const MakerConfigs: MakerProtocolConfig = {
  protocol: 'maker',
  daiJoin: {
    chain: 'ethereum',
    protocol: 'maker',
    address: MakerDaiJoinContract,
  },
  configs: formatMakerConfigs(
    MakerGemJoins.map((item) => {
      const [birthday, address, collateral] = item.split(':');

      return {
        chain: 'ethereum',
        protocol: 'maker',
        metric: DataMetrics.lending,
        type: LendingMarketTypes.cdp,
        version: LendingMarketVersions.cdp.maker,
        birthday: Number(birthday),
        address: address,
        daiJoin: MakerDaiJoinContract,
        vat: MakerVatContract,
        spot: MakerSpotContract,
        jug: MakerJugContract,
        debtToken: {
          chain: 'ethereum',
          symbol: 'DAI',
          decimals: 18,
          address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        },
        collateralToken: (EthereumTokenList as any)[normalizeAddress(collateral)],
      };
    }),
  ),
};
