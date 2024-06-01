// get Bungee supported tokens
import axios from 'axios';
import fs from 'fs';

import { AddressE, AddressZero } from '../configs/constants';
import EnvConfig from '../configs/envConfig';
import { OracleConfigs } from '../configs/oracles/configs';
import { BungeeConfigs } from '../configs/protocols/bungee';
import { normalizeAddress } from '../lib/utils';

(async function () {
  const noOracles: any = {};

  for (const blockchain of Object.values(EnvConfig.blockchains)) {
    let tokens: any = {};
    if (fs.existsSync(`./src/configs/data/tokenlists/${blockchain.name}.json`)) {
      tokens = JSON.parse(fs.readFileSync(`./src/configs/data/tokenlists/${blockchain.name}.json`).toString());
    }

    for (const otherBlockchain of Object.values(EnvConfig.blockchains)) {
      if (blockchain.chainId !== otherBlockchain.chainId) {
        try {
          const response = await axios.get(
            `https://api.socket.tech/v2/token-lists/from-token-list?fromChainId=${blockchain.chainId}&toChainId=${otherBlockchain.chainId}&isShortList=true`,
            {
              headers: {
                'Api-Key': '72a5b4b0-e727-48be-8aa1-5da9d62fe635',
              },
            },
          );
          for (const token of response.data.result) {
            let address = normalizeAddress(token.address);

            if (address === AddressE) {
              address = AddressZero;
            }

            if (address !== AddressZero) {
              tokens[address] = {
                chain: blockchain.name,
                symbol: token.symbol,
                decimals: token.decimals,
                address: address,
              };
            }

            // don't need oracle config for blacklist token
            const bungeeConfig = BungeeConfigs.configs.filter((item) => item.chain == blockchain.name)[0];
            if (bungeeConfig && bungeeConfig.blacklists && bungeeConfig.blacklists.indexOf(address) !== -1) {
              continue;
            }

            if (!OracleConfigs[blockchain.name][address]) {
              if (!noOracles[blockchain.name]) {
                noOracles[blockchain.name] = {};
              }
              noOracles[blockchain.name][address] = true;
            }
          }

          console.log(`got tokens: ${blockchain.name} -> ${otherBlockchain.name}`);
        } catch (e: any) {
          console.log(e);
          process.exit(1);
        }
      }
    }

    fs.writeFileSync(`./src/configs/data/tokenlists/${blockchain.name}.json`, JSON.stringify(tokens));
  }

  console.log(noOracles);
})();
