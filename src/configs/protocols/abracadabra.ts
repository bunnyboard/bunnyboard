import { normalizeAddress } from '../../lib/utils';
import { CdpLendingMarketConfig, DataMetrics, LendingMarketVersions, ProtocolConfig, Token } from '../../types/configs';
import { TokensBook } from '../data';
import { ProtocolNames } from '../names';

export interface AbracadabraCauldronConfig {
  chain: string;
  cauldronVersion: number; // 2 | 3 | 4
  birthday: number;
  address: string;
  collateralToken: Token;
}

export interface AbracadabraMarketConfig extends CdpLendingMarketConfig {
  caldrons: Array<AbracadabraCauldronConfig>;
}

export interface AbracadabraProtocolConfig extends ProtocolConfig {
  configs: Array<AbracadabraMarketConfig>;
}

const DebtTokens: { [key: string]: Token } = {
  ethereum: TokensBook.ethereum['0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3'],
  arbitrum: TokensBook.arbitrum['0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a'],
};

// chain:cauldronVersion:birthday:marketAddress:collateralAddress
const Markets: Array<string> = [
  // ethereum
  'ethereum:2:1630454400:0x7b7473a76D6ae86CE19f7352A1E89F6C9dc39020:0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF', // ALCX
  'ethereum:2:1632960000:0xc1879bf24917ebE531FbAA20b0D05Da027B592ce:0x32353A6C91143bfd6C7d363B546e62a9A2489A20', // AGLD
  'ethereum:2:1634947200:0x252dCf1B621Cc53bc22C256255d2bE5C8c32EaE4:0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIB
  'ethereum:2:1635292800:0xCfc571f3203756319c231d3Bc643Cee807E74636:0x090185f2135308BaD17527004364eBcC2D37e5F6', // SPELL
  'ethereum:2:1641772800:0x5ec47EE69BEde0b6C2A2fC0D9d094dF16C192498:0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  'ethereum:2:1640908800:0x390Db10e65b5ab920C19149C919D970ad9d18A41:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  'ethereum:2:1629849600:0x98a84EfF6e008c5ed0289655CcdCa899bcb6B99F:0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272', // xSUSHI
  'ethereum:2:1647820800:0xf179fe36a36B32a4644587B8cdee7A23af98ed37:0x1635b506a88fBF428465Ad65d00e8d6B6E5846C3', // ycCVXETH
  'ethereum:3:1664323200:0x8227965A7f42956549aFaEc319F4E444aa438Df5:0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', // LUSD
  'ethereum:3:1652140800:0xd31E19A0574dBF09310c3B06f3416661B4Dc7324:0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56', // StargateUSDC
  'ethereum:3:1652140800:0xc6B2b3fE7c3D7a6f823D9106E22e66660709001e:0x38EA452219524Bb87e18dE1C24D3bB59510BD783', // StargateUSDT
  'ethereum:3:1650412800:0x7Ce7D9ED62B9A6c5aCe1c6Ec9aeb115FA3064757:0xdA816459F1AB5631232FE5e97a05BBBb94970c95', // yvDAI
  'ethereum:3:1652313600:0x53375adD9D2dFE19398eD65BAaEFfe622760A9A6:0x5faF6a2D186448Dfa667c51CB3D695c7A6E52d8E', // yvstETH_Concentrated
  'ethereum:4:1670716800:0x207763511da879a900973A5E092382117C3c1588:0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
  'ethereum:4:1682899200:0x7d8dF3E4D06B0e19960c19Ee673c0823BEB90815:0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
  'ethereum:4:1675641600:0x7259e152103756e1616A77Ae982353c3751A6a90:0x8078198Fc424986ae89Ce4a910Fc109587b6aBF3', // yvCrv3Crypto
  'ethereum:4:1676851200:0x692887E8877C6Dd31593cda44c382DB5b289B684:0xf35b31B941D94B249EaDED041DB1b05b7097fEb6', // magicAPE
  'ethereum:4:1671840000:0x406b89138782851d3a8c04c743b010ceb0374352:0xdCD90C7f6324cfa40d7169ef80b12031770B4325', // yvSTETH
  'ethereum:4:1672099200:0x85f60D3ea4E86Af43c9D4E9CC9095281fC25c405:0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  'ethereum:4:1712188800:0xed510639E1b07c9145CD570F8Dd0CA885F760E09:0xa258C4606Ca8206D8aA700cE2143D7db854D168c', // yvWETH
  'ethereum:4:1711756800:0x46f54d434063e5F1a2b2CC6d9AAa657b1B9ff82c:0x9447c1413DA928aF354A114954BFc9E6114c5646', // cvxtricrypto2
  'ethereum:4:1712361600:0x6bcd99D6009ac1666b58CB68fB4A50385945CDA2:0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9', // yvUSDC v2
  'ethereum:4:1711843200:0xC6D3b82f9774Db8F92095b5e4352a8bB8B0dC20d:0x26FA3fFFB6EfE8c1E69103aCb4044C26B9A106a9', // sSPELL
  'ethereum:4:1711929600:0x289424aDD4A1A503870EB475FD8bF1D586b134ED:0x4985cc58C9004772c225aEC9C36Cc9A56EcC8c20', // cvx3Pool

  // arbitrum
  'arbitrum:2:1631664000:0xc89958b03a55b5de2221acb25b58b89a000215e6:0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // ETH
  'arbitrum:4:1701129600:0x7962acfcfc2ccebc810045391d60040f635404fb:0x09400d9db990d5ed3f35d7be61dfaeb900af03c9', // gmSOL
  'arbitrum:4:1674950400:0x726413d7402ff180609d0ebc79506df8633701b1:0x85667409a723684fe1e57dd1abde8d88c2f54214', // magic GLP
  'arbitrum:4:1701216000:0x2b02bbeab8ecab792d3f4dda7a76f63aa21934fa:0x70d95587d40a2caf56bd97485ab3eec10bee6336', // gmETH
  'arbitrum:4:1701216000:0xd7659d913430945600dfe875434b6d80646d552a:0x47c031236e19d024b42f8ae6780e44a573170703', // gmBTC
  'arbitrum:4:1701216000:0x4f9737e994da9811b8830775fd73e2f1c8e40741:0xc25cef6061cf5de5eb761b50e4743c1f5d7e5407', // gmARB
  'arbitrum:4:1701216000:0x66805f6e719d7e67d46e8b2501c1237980996c6a:0x7f1fa204bb700853d36994da19f830b6ad18455c', // gmLINK
  'arbitrum:4:1706313600:0x780db9770ddc236fd659a39430a8a7cc07d0c320:0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // wETH
  'arbitrum:4:1706313600:0x49De724D7125641F56312EBBcbf48Ef107c8FA57:0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', // wBTC
];

function formatMarket(chain: string, birthday: number): AbracadabraMarketConfig {
  const market: AbracadabraMarketConfig = {
    chain: chain,
    protocol: ProtocolNames.abracadabra,
    metric: DataMetrics.cdpLending,
    version: LendingMarketVersions.cdp.abracadabra,
    birthday: birthday,
    address: normalizeAddress(DebtTokens[chain].address),
    debtToken: DebtTokens[chain],
    caldrons: [],
  };

  for (const config of Markets) {
    const [chain, version, cauldronBirthday, address, collateralAddress] = config.split(':');
    if (chain === chain) {
      market.caldrons.push({
        chain: chain,
        cauldronVersion: Number(version),
        birthday: Number(cauldronBirthday),
        address: normalizeAddress(address),
        collateralToken: (TokensBook as any)[chain][normalizeAddress(collateralAddress)],
      });
    }
  }

  return market;
}

export const AbracadabraConfigs: AbracadabraProtocolConfig = {
  protocol: ProtocolNames.abracadabra,
  configs: [
    formatMarket('ethereum', 1621987200), // Wed May 26 2021 00:00:00 GMT+0000
    formatMarket('arbitrum', 1631664000), // Wed Sep 15 2021 00:00:00 GMT+0000
  ],
};
