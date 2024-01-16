import { OracleSourceBearingToken, OracleSourceCompoundOracle } from '../../types/oracles';
import EthereumTokenList from '../tokenlists/ethereum.json';
import GnosisTokenList from '../tokenlists/gnosis.json';

export const OracleSourceCustomList: { [key: string]: OracleSourceBearingToken | OracleSourceCompoundOracle } = {
  SAVING_DAI: {
    type: 'savingDai',
    chain: 'ethereum',
    address: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
    token: EthereumTokenList['0x6b175474e89094c44da98b954eedeac495271d0f'],
  },
  SAVING_xDAI: {
    type: 'savingDai',
    chain: 'gnosis',
    address: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
    token: GnosisTokenList['0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'],
  },
};
