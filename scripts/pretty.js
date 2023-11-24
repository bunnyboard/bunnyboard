/* eslint-disable */
const fs = require('fs');

const chains = ['ethereum', 'arbitrum', 'base', 'polygon', 'optimism', 'bnbchain', 'fantom', 'avalanche'];

for (const chain of chains) {
  const tokenLis = require(`../src/configs/tokenlists/${chain}.json`);
  for (const [key] of Object.entries(tokenLis)) {
    tokenLis[key].address = tokenLis[key].address.toLowerCase();
  }

  let ordered = Object.keys(tokenLis)
    .sort()
    .reduce((obj, key) => {
      obj[key] = tokenLis[key];
      return obj;
    }, {});

  fs.writeFileSync(`./src/configs/tokenlists/${chain}.json`, JSON.stringify(ordered).toString());
}
