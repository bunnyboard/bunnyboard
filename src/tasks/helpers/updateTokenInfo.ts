import fs from 'fs';
import { Token } from '../../types/configs';
import { normalizeAddress } from '../../lib/utils';

const path = './src/configs/data/tokenlists';

export default function updateTokenInfo(tokens: Array<Token>) {
  for (const token of tokens) {
    let existedTokens: any = {};
    const filePath = `${path}/${token.chain}.json`;
    if (fs.existsSync(filePath)) {
      existedTokens = JSON.parse(fs.readFileSync(filePath).toString());
    }
    existedTokens[normalizeAddress(token.address)] = {
      ...token,
      address: normalizeAddress(token.address),
    };
    fs.writeFileSync(filePath, JSON.stringify(existedTokens));
  }
}
