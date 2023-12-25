import { ProtocolConfig } from '../../types/configs';
import { BlockchainConfigs } from '../blockchains';

export const EthereumProtocolConfigs: ProtocolConfig = {
  protocol: 'ethereum',
  chainMetrics: [
    {
      ...BlockchainConfigs.ethereum,
      publicRpc: 'https://eth.llamarpc.com',
    },
  ],
};
