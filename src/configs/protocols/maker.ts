import { normalizeAddress } from '../../lib/utils';
import { CdpLendingMarketConfig, DataMetrics, LendingMarketVersions, ProtocolConfig, Token } from '../../types/configs';
import { TokensBook } from '../data';

const MakerDaiJoinContract = '0x9759a6ac90977b93b58547b4a71c78317f391a28';
const MakerVatContract = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b';
const MakerSpotContract = '0x65c79fcb50ca1594b025960e539ed7a9a6d434a3';
const MakerJugContract = '0x19c0976f590d67707e62397c87829d896dc0f1f1';

const MakerGemJoins: Array<string> = [
  // address:collateral
  '0x2F0b23f53734252Bda2277357e97e1517d6B042A:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH-A
  '0x08638eF1A205bE6762A8b935F5da9b700Cf7322c:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH-B
  '0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH-C
  '0x10CD5fbe1b404B7E19Ef964B63939907bdaf42E2:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH-A
  '0x248cCBf4864221fC0E840F29BB042ad5bFC89B5c:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH-B
  '0xC6424e862f1462281B0a5FAc078e4b63006bDEBF:0xae78736cd615f374d3085123a210448e74fc6393', // RETH-A
  '0x7e62B7E279DFC78DEB656E34D6a435cC08a44666:0x8e870d67f660d95d5be530380d0ec0bd388289e1', // PAXUSD-A
  '0xA191e578a6736167326d05c119CE0c90849E84B7:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC-A
  '0x2600004fd1585f7270756DDc88aD9cfA10dD0428:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC-B
  '0xBF72Da2Bd84c5170618Fbe5914B0ECA9638d5eb5:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC-A
  '0xfA8c996e158B80D77FbD0082BB437556A65B96E0:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC-B
  '0x7f62f9592b823331E012D3c5DdF2A7714CfB9de2:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC-C
  '0xe29A14bcDeA40d83675aa43B72dF07f649738C8b:0x056fd409e1d7a124bd7017459dfea2f387b6d5cd', // GUSD-A

  '0x0A59649758aa4d66E25f08Dd01271e891fe52199:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // PSM USDC-A
  '0x7bbd8cA5e413bCa521C2c80D8d1908616894Cf21:0x8e870d67f660d95d5be530380d0ec0bd388289e1', // PSM USDP-A
  '0x79A0FA989fb7ADf1F8e80C93ee605Ebb94F7c6A5:0x056fd409e1d7a124bd7017459dfea2f387b6d5cd', // PSM GUSD-A

  // RWA
  '0x476b81c12Dc71EDfad1F64B9E07CaA60F4b156E2:0x10b2aa5d77aa6484886d8e244f0686ab319a270d', // RWA001-A
  '0xe72C7e90bc26c11d45dBeE736F0acf57fC5B7152:0xaaa760c2027817169d7c8db0dc61a2fb4c19ac23', // RWA002-A
  '0x1Fe789BBac5b141bdD795A3Bc5E12Af29dDB4b86:0x07f0a80ad7aeb7bfb7f139ea71b3c8f7e17156b9', // RWA003-A
  '0xD50a8e9369140539D1c2D113c4dC1e659c6242eB:0x873f2101047a62f84456e3b2b13df2287925d3f9', // RWA004-A
  '0xA4fD373b93aD8e054970A3d6cd4Fd4C31D08192e:0x6db236515e90fc831d146f5829407746eddc5296', // RWA005-A
  // '0x5E11E34b6745FeBa9449Ae53c185413d6EdC66BE:0x4ee03cfbf6e784c462839f5954d60f7c2b60b113', // RWA006-A
  '0x476aaD14F42469989EFad0b7A31f07b795FF0621:0x078fb926b041a816FaccEd3614Cf1E4bc3C723bD', // RWA007-A
  // '0x56eDD5067d89D4E65Bf956c49eAF054e6Ff0b262:0xb9737098b50d7c536b6416daeb32879444f59fca', // RWA008-A
  '0xEe0FC514280f09083a32AE906cCbD2FAc4c680FA:0x8b9734bbaA628bFC0c9f323ba08Ed184e5b88Da2', // RWA009-A
  '0x75646F68B8c5d8F415891F7204978Efb81ec6410:0x3c7f1379b5ac286eb3636668deae71eaa5f7518c', // RWA012-A
  '0x779D0fD012815D4239BAf75140e6B2971BEd5113:0xd6c7fd4392d328e4a8f8bc50f4128b64f4db2d4c', // RWA013-A
  '0xAd722E51569EF41861fFf5e11942a8E07c7C309e:0x75dca04c4acc1ffb0aef940e5b49e2c17416008a', // RWA014-A
  '0x8938988f7B368f74bEBdd3dcd8D6A3bd18C15C0b:0xf5E5E706EfC841BeD1D24460Cd04028075cDbfdE', // RWA015-A
];

export interface MakerGem {
  address: string;
  collateralToken: Token;
}

export interface MakerLendingMarketConfig extends CdpLendingMarketConfig {
  daiJoin: string;
  vat: string;
  spot: string;
  jug: string;
  gems: Array<MakerGem>;
}

export interface MakerProtocolConfig extends ProtocolConfig {
  configs: Array<MakerLendingMarketConfig>;
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
      gems: item.gems.map((item) => {
        return {
          address: normalizeAddress(item.address),
          collateralToken: {
            ...item.collateralToken,
            address: normalizeAddress(item.collateralToken.address),
          },
        };
      }),
    };
  });
}

const MakerMarket: MakerLendingMarketConfig = {
  chain: 'ethereum',
  protocol: 'maker',
  metric: DataMetrics.cdpLending,
  version: LendingMarketVersions.cdp.maker,
  birthday: 1573689600, // Thu Nov 14 2019 00:00:00 GMT+0000
  address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI address
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
  gems: MakerGemJoins.map((item) => {
    const [address, collateral] = item.split(':');
    return {
      address: address,
      collateralToken: (TokensBook.ethereum as any)[normalizeAddress(collateral)],
    };
  }),
};

export const MakerConfigs: MakerProtocolConfig = {
  protocol: 'maker',
  configs: formatMakerConfigs([MakerMarket]),
};
