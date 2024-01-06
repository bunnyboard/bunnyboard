import { normalizeAddress } from '../../lib/utils';
import { ProtocolConfig } from '../../types/configs';

export const GmxConfigs: ProtocolConfig = {
  protocol: 'gmx',
  perpetualMarkets: [
    {
      chain: 'arbitrum',
      protocol: 'gmx',
      birthday: 1630454400, // Wed Sep 01 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x489ee077994B6658eAfA855C308275EAd8097C4A'),
    },
    {
      chain: 'avalanche',
      protocol: 'gmx',
      birthday: 1639785600, // Sat Dec 18 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x9ab2De34A33fB459b538c43f251eB825645e8595'),
    },
  ],
};
