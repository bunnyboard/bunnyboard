import * as fs from 'fs';

import CauldronV4Abi from '../configs/abi/abracadabra/CauldronV4.json';
import { normalizeAddress } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';

const directoryPath = './src/configs/data/tokenlists';

function loadExistedTokens(chain: string) {
  if (fs.existsSync(`${directoryPath}/${chain}.json`)) {
    return JSON.parse(fs.readFileSync(`${directoryPath}/${chain}.json`).toString());
  }

  return {};
}

const Markets = [
  'ethereum:0x551a7CfF4de931F32893c928bBc3D25bF1Fc5147',
  'ethereum:0x6cbAFEE1FaB76cA5B5e144c43B3B50d42b7C8c8f',
  'ethereum:0xFFbF4892822e0d552CFF317F65e1eE7b5D3d9aE6',
  'ethereum:0x6Ff9061bB8f97d948942cEF376d98b51fA38B91f',
  'ethereum:0xbb02A884621FB8F5BFd263A67F58B65df5b090f3',
  'ethereum:0x05500e2Ee779329698DF35760bEdcAAC046e7C27',
  'ethereum:0x003d5A75d284824Af736df51933be522DE9Eed0f',
  'ethereum:0xbc36FdE44A7FD8f545d459452EF9539d7A14dd63',
  'ethereum:0x59E9082E068Ddb27FC5eF1690F9a9f22B32e573f',
  'ethereum:0x0BCa8ebcB26502b013493Bf8fE53aA2B1ED401C1',
  'ethereum:0x806e16ec797c69afa8590A55723CE4CC1b54050E',
  'ethereum:0x6371EfE5CD6e3d2d7C477935b7669401143b7985',
  'ethereum:0xC319EEa1e792577C319723b5e60a15dA3857E7da',
  'ethereum:0x9617b633EF905860D919b88E1d9d9a6191795341',
  'ethereum:0x35a0Dd182E4bCa59d5931eae13D0A2332fA30321',
  'ethereum:0x3410297D89dCDAf4072B805EFc1ef701Bb3dd9BF',
  'ethereum:0x4EAeD76C3A388f4a841E9c765560BBe7B3E4B3A0',
  'ethereum:0x920d9bd936da4eafb5e25c6bdc9f6cb528953f9f',
  'ethereum:0xEBfDe87310dc22404d918058FAa4D56DC4E93f0A',
  'ethereum:0x257101F20cB7243E2c7129773eD5dBBcef8B34E0',
  'ethereum:0x390Db10e65b5ab920C19149C919D970ad9d18A41',

  // 'ethereum:0x7b7473a76D6ae86CE19f7352A1E89F6C9dc39020',
  // 'ethereum:0xc1879bf24917ebE531FbAA20b0D05Da027B592ce',
  // 'ethereum:0x252dCf1B621Cc53bc22C256255d2bE5C8c32EaE4',
  // 'ethereum:0xCfc571f3203756319c231d3Bc643Cee807E74636',
  // 'ethereum:0x5ec47EE69BEde0b6C2A2fC0D9d094dF16C192498',
  // 'ethereum:0x390Db10e65b5ab920C19149C919D970ad9d18A41',
  // 'ethereum:0x98a84EfF6e008c5ed0289655CcdCa899bcb6B99F',
  // 'ethereum:0xf179fe36a36B32a4644587B8cdee7A23af98ed37',
  // 'ethereum:0x8227965A7f42956549aFaEc319F4E444aa438Df5',
  // 'ethereum:0xd31E19A0574dBF09310c3B06f3416661B4Dc7324',
  // 'ethereum:0xc6B2b3fE7c3D7a6f823D9106E22e66660709001e',
  // 'ethereum:0x7Ce7D9ED62B9A6c5aCe1c6Ec9aeb115FA3064757',
  // 'ethereum:0x53375adD9D2dFE19398eD65BAaEFfe622760A9A6',
  // 'ethereum:0x207763511da879a900973A5E092382117C3c1588',
  // 'ethereum:0x7d8dF3E4D06B0e19960c19Ee673c0823BEB90815',
  // 'ethereum:0x7259e152103756e1616A77Ae982353c3751A6a90',
  // 'ethereum:0x692887E8877C6Dd31593cda44c382DB5b289B684',
  // 'ethereum:0x406b89138782851d3a8c04c743b010ceb0374352',
  // 'ethereum:0x85f60D3ea4E86Af43c9D4E9CC9095281fC25c405',
  // 'ethereum:0xed510639E1b07c9145CD570F8Dd0CA885F760E09',
  // 'ethereum:0x46f54d434063e5F1a2b2CC6d9AAa657b1B9ff82c',
  // 'ethereum:0x6bcd99D6009ac1666b58CB68fB4A50385945CDA2',
  // 'ethereum:0xC6D3b82f9774Db8F92095b5e4352a8bB8B0dC20d',
  // 'ethereum:0x289424aDD4A1A503870EB475FD8bF1D586b134ED'

  // 'arbitrum:0xC89958B03A55B5de2221aCB25B58B89A000215E6',
  // 'arbitrum:0x7962ACFcfc2ccEBC810045391D60040F635404fb',
  // 'arbitrum:0x726413d7402fF180609d0EBc79506df8633701B1',
  // 'arbitrum:0x2b02bBeAb8eCAb792d3F4DDA7a76f63Aa21934FA',
  // 'arbitrum:0xD7659D913430945600dfe875434B6d80646d552A',
  // 'arbitrum:0x4F9737E994da9811B8830775Fd73E2F1C8e40741',
  // 'arbitrum:0x66805F6e719d7e67D46e8b2501C1237980996C6a',
  // 'arbitrum:0x780db9770dDc236fd659A39430A8a7cC07D0C320',
  // 'arbitrum:0x49De724D7125641F56312EBBcbf48Ef107c8FA57',
];

(async function () {
  const tokenByChains: any = {
    ethereum: loadExistedTokens('ethereum'),
    arbitrum: loadExistedTokens('arbitrum'),
    polygon: loadExistedTokens('polygon'),
    optimism: loadExistedTokens('optimism'),
    bnbchain: loadExistedTokens('bnbchain'),
    base: loadExistedTokens('base'),
    fantom: loadExistedTokens('fantom'),
    avalanche: loadExistedTokens('avalanche'),
    metis: loadExistedTokens('metis'),
    gnosis: loadExistedTokens('gnosis'),
    scroll: loadExistedTokens('scroll'),
  };

  const blockchain = new BlockchainService();
  for (const config of Markets) {
    const [chain, cauldron] = config.split(':');
    const collateral = await blockchain.readContract({
      chain: chain,
      abi: CauldronV4Abi,
      target: cauldron,
      method: 'collateral',
      params: [],
    });
    const token = await blockchain.getTokenInfo({
      chain: chain,
      address: collateral.toString(),
      onchain: true,
    });
    if (token) {
      console.log(`${normalizeAddress(cauldron)}:${token.address}`);
      tokenByChains[token.chain][token.address] = token;
    } else {
      console.log(`failed to get token info ${chain}:${collateral}`);
    }
  }

  for (const [chain, tokens] of Object.entries(tokenByChains)) {
    fs.writeFileSync(`${directoryPath}/${chain}.json`, JSON.stringify(tokens));
  }
})();
