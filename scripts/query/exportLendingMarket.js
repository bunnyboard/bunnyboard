const axios = require('axios');
const fs = require('fs');

const apiEndpoint = 'https://data.magicbunny.xyz';

const chain = 'ethereum';
const market = '0x398ec7346dcd622edc5ae82352f02be94c62d119'; // aave v1
const token = '0x0000000000000000000000000000000000000000';

(async function() {
	const response = await axios.get(`${apiEndpoint}/magicbunny/lending/market/chain/${chain}/address/${market}/token/${token}`);
	console.log(response.data.result);
})()
