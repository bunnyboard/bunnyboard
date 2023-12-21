import { getTimestamp, normalizeAddress } from '../lib/utils';
import UniswapLibs from '../modules/libs/uniswap';
import OracleService from '../services/oracle/oracle';
import { BasicCommand } from './basic';

export class GetTokenPriceCommand extends BasicCommand {
  public readonly name: string = 'getTokenPrice';
  public readonly describe: string = 'Get token price USD at a given timestamp';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const chain = argv.chain;
    const address = normalizeAddress(argv.address);
    const timestamp = argv.timestamp ? argv.timestamp : getTimestamp();

    const oracle = new OracleService();

    if (argv.lpUniv2) {
      const pool2 = await UniswapLibs.getPool2Constant(chain, address);
      if (pool2) {
        const priceUsd = await oracle.getUniv2TokenPriceUsd({
          pool2,
          timestamp,
        });
        console.log(`${chain} ${address} ${timestamp} ${priceUsd}`);
      } else {
        console.log('Failed to get pool2 info.');
      }
    } else {
      const priceUsd = await oracle.getTokenPriceUsd({
        chain,
        address,
        timestamp,
      });

      console.log(`${chain} ${address} ${timestamp} ${priceUsd}`);
    }

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      chain: {
        type: 'string',
        default: '',
        describe: 'Blockchain where token was deployed.',
      },
      address: {
        type: 'string',
        default: '',
        describe: 'The token contract address.',
      },
      lpUniv2: {
        type: 'boolean',
        default: false,
        describe: 'The token is a univ2 LP token.',
      },
      timestamp: {
        type: 'number',
        default: 0,
        describe: 'Get the latest price if timestamp was not given.',
      },
    });
  }
}
