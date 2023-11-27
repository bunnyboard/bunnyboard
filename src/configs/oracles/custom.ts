import { OracleSourceBearingToken } from '../../types/configs';
import EthereumTokenList from '../tokenlists/ethereum.json';

export const OracleSourceCustomList: { [key: string]: OracleSourceBearingToken } = {
  SAVING_DAI: {
    type: 'savingDai',
    chain: 'ethereum',
    address: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
    token: EthereumTokenList.DAI,
  },
};
