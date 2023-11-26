import { OracleConfig } from '../../types/configs';
import { AddressE, AddressF, AddressZero } from '../constants';
import { OracleCurrencyBaseConfigs } from './currency';

// chain => tokenAddress => config
export const OracleConfigs: { [key: string]: { [key: string]: OracleConfig } } = {
  ethereum: {
    [AddressZero]: OracleCurrencyBaseConfigs.eth,
    [AddressE]: OracleCurrencyBaseConfigs.eth,
    [AddressF]: OracleCurrencyBaseConfigs.eth,
  },
};
