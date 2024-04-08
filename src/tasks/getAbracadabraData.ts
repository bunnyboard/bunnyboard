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
  // 'ethereum:0x289424aDD4A1A503870EB475FD8bF1D586b134ED',
  'arbitrum:0xC89958B03A55B5de2221aCB25B58B89A000215E6',
  'arbitrum:0x7962ACFcfc2ccEBC810045391D60040F635404fb',
  'arbitrum:0x726413d7402fF180609d0EBc79506df8633701B1',
  'arbitrum:0x2b02bBeAb8eCAb792d3F4DDA7a76f63Aa21934FA',
  'arbitrum:0xD7659D913430945600dfe875434B6d80646d552A',
  'arbitrum:0x4F9737E994da9811B8830775Fd73E2F1C8e40741',
  'arbitrum:0x66805F6e719d7e67D46e8b2501C1237980996C6a',
  'arbitrum:0x780db9770dDc236fd659A39430A8a7cC07D0C320',
  'arbitrum:0x49De724D7125641F56312EBBcbf48Ef107c8FA57',
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
    }
  }

  for (const [chain, tokens] of Object.entries(tokenByChains)) {
    fs.writeFileSync(`${directoryPath}/${chain}.json`, JSON.stringify(tokens));
  }
})();
