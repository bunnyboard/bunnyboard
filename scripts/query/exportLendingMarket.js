const axios = require('axios');
const fs = require('fs');

const apiEndpoint = 'https://data.magicbunny.xyz';

const chain = 'ethereum';
const market = '0x398ec7346dcd622edc5ae82352f02be94c62d119'; // aave v1
const token = '0x0000000000000000000000000000000000000000';

const marketId = `lending-market-${chain}-${market}-${token}`;

const snapshots = require(`../data/${marketId}.json`);

(async function () {
  // const response = await axios.get(`${apiEndpoint}/magicbunny/lending/market/chain/${chain}/address/${market}/token/${token}`);

  const fields = ['timestamp', 'tokenPrice', 'totalDeposited', 'totalBorrowed'];

  fs.writeFileSync(`./scripts/data/${marketId}.csv`, `${fields.toString()}\n`);
  for (const snapshot of snapshots) {
    const data = [];
    for (const field of fields) {
      data.push(snapshot[field]);
    }

    fs.appendFileSync(`./scripts/data/${marketId}.csv`, `${data.toString()}\n`);
  }
})();
