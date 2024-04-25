/* eslint-disable */
const fs = require('fs');

const chains = [
  'ethereum',
  'arbitrum',
  'base',
  'polygon',
  'optimism',
  'bnbchain',
  'fantom',
  'avalanche',
  'metis',
  'gnosis',
  'blast',
  'linea',
  'zksync',
  'manta',
];

for (const chain of chains) {
  // pretty token configs
  const tokenList = require(`../src/configs/data/tokenlists/${chain}.json`);
  for (const [key] of Object.entries(tokenList)) {
    tokenList[key].address = tokenList[key].address.toLowerCase();
  }

  let ordered = Object.keys(tokenList)
    .sort()
    .reduce((obj, key) => {
      obj[key] = tokenList[key];
      return obj;
    }, {});

  fs.writeFileSync(`./src/configs/data/tokenlists/${chain}.json`, JSON.stringify(ordered).toString());

  // pretty address configs
  const addressBookPath = `./src/configs/data/addresses/${chain}.json`;
  if (fs.existsSync(addressBookPath)) {
    const addressBook = require(`../src/configs/data/addresses/${chain}.json`);

    for (const [key, value] of Object.entries(addressBook)) {
      addressBook[key] = value.toLowerCase();
    }

    let addressOrdered = Object.keys(addressBook)
      .sort()
      .reduce((obj, key) => {
        obj[key] = addressBook[key];
        return obj;
      }, {});

    fs.writeFileSync(`./src/configs/data/addresses/${chain}.json`, JSON.stringify(addressOrdered).toString());
  }
}
