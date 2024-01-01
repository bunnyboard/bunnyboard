import { OracleSourceBearingToken } from '../../types/configs';
import EthereumTokenList from '../tokenlists/ethereum.json';
import GnosisTokenList from '../tokenlists/gnosis.json';

export const OracleSourceCustomList: { [key: string]: OracleSourceBearingToken } = {
  SAVING_DAI: {
    type: 'savingDai',
    chain: 'ethereum',
    address: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
    token: EthereumTokenList.DAI,
  },
  SAVING_xDAI: {
    type: 'savingDai',
    chain: 'gnosis',
    address: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
    token: GnosisTokenList.WXDAI,
  },
};
