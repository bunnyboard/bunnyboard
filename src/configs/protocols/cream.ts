import { AddressZero } from '../constants';
import BnbchainTokenList from '../tokenlists/bnbchain.json';
import EthereumTokenList from '../tokenlists/ethereum.json';
import { CompoundProtocolConfig } from './compound';

export const CreamConfigs: CompoundProtocolConfig = {
  protocol: 'cream',
  comptrollers: {},
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1596412800, // Mon Aug 03 2020 00:00:00 GMT+0000
      address: '0xd06527d5e56a3495252a528c4987003b712860ee',
      underlying: {
        chain: 'ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: AddressZero,
      },
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1596412800, // Mon Aug 03 2020 00:00:00 GMT+0000
      address: '0x797aab1ce7c01eb727ab980762ba88e7133d2157',
      underlying: EthereumTokenList.USDT,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1596412800, // Mon Aug 03 2020 00:00:00 GMT+0000
      address: '0x44fbebd2f576670a6c33f6fc0b00aa8c5753b322',
      underlying: EthereumTokenList.USDC,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1596412800, // Mon Aug 03 2020 00:00:00 GMT+0000
      address: '0xcbae0a83f4f9926997c8339545fb8ee32edc6b76',
      underlying: EthereumTokenList.YFI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1596412800, // Mon Aug 03 2020 00:00:00 GMT+0000
      address: '0xce4fe9b4b8ff61949dcfeb7e03bc9faca59d2eb3',
      underlying: EthereumTokenList.BAL,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1596412800, // Mon Aug 03 2020 00:00:00 GMT+0000
      address: '0x19d1666f543d42ef17f66e376944a22aea1a8e46',
      underlying: EthereumTokenList.COMP,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1596412800, // Mon Aug 03 2020 00:00:00 GMT+0000
      address: '0x9baf8a5236d44ac410c0186fe39178d5aad0bb87',
      underlying: {
        chain: 'ethereum',
        symbol: 'yCRV',
        decimals: 18,
        address: '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8',
      },
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1597190400, // Wed Aug 12 2020 00:00:00 GMT+0000
      address: '0x892b14321a4fcba80669ae30bd0cd99a7ecf6ac0',
      underlying: EthereumTokenList.CREAM,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1597190400, // Wed Aug 12 2020 00:00:00 GMT+0000
      address: '0x697256caa3ccafd62bb6d3aa1c7c5671786a5fd9',
      underlying: EthereumTokenList.LINK,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1597536000,
      address: '0x8b86e0598616a8d4f1fdae8b59e55fb5bc33d0d6',
      underlying: EthereumTokenList.LEND,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1597881600,
      address: '0xc7fd8dcee4697ceef5a2fd4608a7bd6a94c77480',
      underlying: EthereumTokenList.CRV,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1598140800,
      address: '0x17107f40d70f4470d20cb3f138a052cae8ebd4be',
      underlying: EthereumTokenList.renBTC,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1598313600, // Tue Aug 25 2020 00:00:00 GMT+0000
      address: '0x1ff8cdb51219a8838b52e9cac09b71e591bc998e',
      underlying: EthereumTokenList.BUSD,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1598832000,
      address: '0x3623387773010d9214b10c551d6e7fc375d31f58',
      underlying: EthereumTokenList.MTA,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1598918400,
      address: '0x4ee15f44c6f0d8d1136c83efd2e8e4ac768954c6',
      underlying: {
        chain: 'ethereum',
        symbol: 'yyCRV',
        decimals: 18,
        address: '0x5dbcf33d8c2e976c6b560249878e6f1491bca25c',
      },
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1599004800,
      address: '0x338286c0bc081891a4bda39c7667ae150bf5d206',
      underlying: EthereumTokenList.SUSHI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1599004800,
      address: '0x10fdbd1e48ee2fd9336a482d746138ae19e649db',
      underlying: EthereumTokenList.FTT,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1599091200,
      address: '0x01da76dea59703578040012357b81ffe62015c2d',
      underlying: {
        chain: 'ethereum',
        symbol: 'yETH',
        decimals: 18,
        address: '0xe1237aa7f535b0cc33fd973d66cbf830354d16c7',
      },
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1599782400,
      address: '0xef58b2d5a1b8d3cde67b8ab054dc5c831e9bc025',
      underlying: EthereumTokenList.SRM,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1600387200,
      address: '0xe89a6d0509faf730bd707bf868d9a2a744a363c7',
      underlying: EthereumTokenList.UNI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1603152000,
      address: '0xeff039c3c1d668f408d09dd7b63008622a77532c',
      underlying: EthereumTokenList.wNXM,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1603324800,
      address: '0x22b243b96495c547598d9042b6f94b01c22b2e9e',
      underlying: EthereumTokenList.SWAG,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1603756800,
      address: '0x8b3ff1ed4f36c2c2be675afb13cc3aa5d73685a5',
      underlying: EthereumTokenList.CEL,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1604534400,
      address: '0x2a537fa9ffaea8c1a41d3c2b68a9cb791529366d',
      underlying: EthereumTokenList.DPI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1604707200,
      address: '0x7ea9c63e216d5565c3940a2b3d150e59c2907db3',
      underlying: EthereumTokenList.BBTC,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1604966400,
      address: '0x3225e3c669b39c7c8b3e204a8614bb218c5e31bc',
      underlying: EthereumTokenList.AAVE,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1605312000,
      address: '0xf55bbe0255f7f4e70f63837ff72a577fbddbe924',
      underlying: EthereumTokenList.BOND,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1605312000,
      address: '0x903560b1cce601794c584f58898da8a8b789fc5d',
      underlying: EthereumTokenList.KP3R,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1605830400,
      address: '0x054b7ed3f45714d3091e82aad64a1588dc4096ed',
      underlying: EthereumTokenList.HBTC,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1605830400,
      address: '0xd5103afcd0b3fa865997ef2984c66742c51b2a8b',
      underlying: EthereumTokenList.HFIL,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1606348800,
      address: '0xfd609a03b393f1a1cfcacedabf068cad09a924e2',
      underlying: EthereumTokenList.CRETH2,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1606780800,
      address: '0xd692ac3245bb82319a31068d6b8412796ee85d2c',
      underlying: EthereumTokenList.HUSD,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1606953600,
      address: '0x92b767185fb3b04f881e3ac8e5b0662a027a1d9f',
      underlying: EthereumTokenList.DAI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1608249600,
      address: '0x10a3da2bb0fae4d591476fd97d6636fd172923a8',
      underlying: EthereumTokenList.HEGIC,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1609372800,
      address: '0x3c6c553a95910f9fc81c98784736bd628636d296',
      underlying: EthereumTokenList.ESD,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1610755200,
      address: '0x21011bc93d9e515b9511a817a1ed1d6d468f49fc',
      underlying: EthereumTokenList.COVER,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1611014400,
      address: '0x85759961b116f1d36fd697855c57a6ae40793d9b',
      underlying: EthereumTokenList['1INCH'],
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1611014400,
      address: '0x7aaa323d7e398be4128c7042d197a2545f0f1fea',
      underlying: EthereumTokenList.OMG,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612569600,
      address: '0x228619cca194fbe3ebeb2f835ec1ea5080dafbb2',
      underlying: EthereumTokenList.xSUSHI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0x197070723ce0d3810a0e47f06e935c30a480d4fc',
      underlying: EthereumTokenList.WBTC,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0xc25eae724f189ba9030b2556a1533e7c8a732e14',
      underlying: EthereumTokenList.SNX,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0x25555933a8246ab67cbf907ce3d1949884e82b55',
      underlying: EthereumTokenList.sUSD,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0xc68251421edda00a10815e273fa4b1191fac651b',
      underlying: EthereumTokenList.PICKLE,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0x65883978ada0e707c3b2be2a6825b1c4bdf76a90',
      underlying: EthereumTokenList.AKRO,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0x8b950f43fcac4931d408f1fcda55c6cb6cbf3096',
      underlying: EthereumTokenList.BBADGER,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0x59089279987dd76fc65bf94cb40e186b96e03cb3',
      underlying: EthereumTokenList.OGN,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0x2db6c82ce72c8d7d770ba1b5f5ed0b6e075066d6',
      underlying: EthereumTokenList.AMP,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1612915200,
      address: '0xb092b4601850e23903a42eacbc9d8a0eec26a4d5',
      underlying: EthereumTokenList.FRAX,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1613692800,
      address: '0x1d0986fb43985c88ffa9ad959cc24e6a087c7e35',
      underlying: EthereumTokenList.ALPHA,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1614729600,
      address: '0x51f48b638f82e8765f7a26373a2cb4ccb10c07af',
      underlying: EthereumTokenList.UST,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1615593600,
      address: '0xc36080892c64821fa8e396bc1bd8678fa3b82b17',
      underlying: EthereumTokenList.FTM,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1616198400,
      address: '0x8379baa817c5c5ab929b03ee8e3c48e45018ae41',
      underlying: EthereumTokenList.RUNE,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1616198400,
      address: '0x299e254a8a165bbeb76d9d69305013329eea3a3b',
      underlying: EthereumTokenList.PERP,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1616630400,
      address: '0xf8445c529d363ce114148662387eba5e62016e20',
      underlying: EthereumTokenList.RAI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1617753600,
      address: '0x7c3297cfb4c4bbd5f44b450c0872e0ada5203112',
      underlying: EthereumTokenList.OCEAN,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1618876800,
      address: '0x081fe64df6dc6fc70043aedf3713a3ce6f190a21',
      underlying: EthereumTokenList.RARI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1620864000,
      address: '0xdfff11dfe6436e42a17b86e7f419ac8292990393',
      underlying: EthereumTokenList.arNXM,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1620864000,
      address: '0xdbb5e3081def4b6cdd8864ac2aeda4cbf778fecf',
      underlying: EthereumTokenList.MLN,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1621382400,
      address: '0x1a122348b73b58ea39f822a89e6ec67950c2bbd0',
      underlying: EthereumTokenList.vVSP,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1622073600,
      address: '0x523effc8bfefc2948211a05a905f761cba5e8e9e',
      underlying: EthereumTokenList.GNO,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1622505600,
      address: '0x4202d97e00b9189936edf37f8d01cff88bdd81d4',
      underlying: {
        chain: 'ethereum',
        symbol: 'yvWETH',
        decimals: 18,
        address: '0xa9fe4601811213c340e850ea305481aff02f5b28',
      },
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1622592000,
      address: '0x4baa77013ccd6705ab0522853cb0e9d453579dd4',
      underlying: {
        chain: 'ethereum',
        symbol: 'yUSD',
        decimals: 18,
        address: '0x4b5bfd52124784745c1071dcb244c6688d2533d3',
      },
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1623283200,
      address: '0x8c3b7a4320ba70f8239f83770c4015b5bc4e6f91',
      underlying: EthereumTokenList.FEI,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1624924800,
      address: '0xe585c76573d7593abf21537b607091f76c996e73',
      underlying: EthereumTokenList.WOO,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1625875200,
      address: '0x81e346729723c4d15d0fb1c5679b9f2926ff13c6',
      underlying: EthereumTokenList.BNT,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1627430400,
      address: '0xd7394428536f63d5659cc869ef69d10f9e66314b',
      underlying: EthereumTokenList.PAX,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1627430400,
      address: '0x1241b10e7ea55b22f5b2d007e8fecdf73dcff999',
      underlying: EthereumTokenList.PAXG,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1627430400,
      address: '0x2a867fd776b83e1bd4e13c6611afd2f6af07ea6d',
      underlying: EthereumTokenList.BBTC,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1631145600,
      address: '0xf04ce2e71d32d789a259428ddcd02d3c9f97fb4e',
      underlying: EthereumTokenList.AXS,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1631145600,
      address: '0x89e42987c39f72e2ead95a8a5bc92114323d5828',
      underlying: EthereumTokenList.SAND,
    },
    {
      chain: 'ethereum',
      protocol: 'cream',
      version: 'compound',
      birthday: 1631145600,
      address: '0x58da9c9fc3eb30abbcbbab5ddabb1e6e2ef3d2ef',
      underlying: EthereumTokenList.MANA,
    },

    // bnbchain
    {
      chain: 'bnbchain',
      protocol: 'cream',
      version: 'compound',
      birthday: 1599004800,
      address: '0x1ffe17b99b439be0afc831239ddecda2a790ff3a',
      underlying: {
        chain: 'bnbchain',
        symbol: 'BNB',
        decimals: 18,
        address: AddressZero,
      },
    },
    {
      chain: 'bnbchain',
      protocol: 'cream',
      version: 'compound',
      birthday: 1617321600,
      address: '0x15cc701370cb8ada2a2b6f4226ec5cf6aa93bc67',
      underlying: BnbchainTokenList.WBNB,
    },
  ],
};