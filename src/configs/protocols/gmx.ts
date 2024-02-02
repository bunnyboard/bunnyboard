import { normalizeAddress } from '../../lib/utils';
import { DataMetrics, PerpetualMarketConfig, ProtocolConfig } from '../../types/configs';

export interface GmxPerpetualMarketConfig extends PerpetualMarketConfig {
  reader: string;
  positionRouter: string;
}

export interface GmxProtocolConfig extends ProtocolConfig {
  configs: Array<GmxPerpetualMarketConfig>;
}

function formatGmxConfigs(configs: Array<GmxPerpetualMarketConfig>): Array<GmxPerpetualMarketConfig> {
  return configs.map((config) => {
    return {
      ...config,
      address: normalizeAddress(config.address),
      reader: normalizeAddress(config.reader),
    };
  });
}

export const GmxConfigs: GmxProtocolConfig = {
  protocol: 'gmx',
  configs: formatGmxConfigs([
    {
      chain: 'arbitrum',
      protocol: 'gmx',
      metric: DataMetrics.perpetual,
      birthday: 1630454400, // Wed Sep 01 2021 00:00:00 GMT+0000
      address: '0x489ee077994b6658eafa855c308275ead8097c4a',
      reader: '0x22199a49A999c351eF7927602CFB187ec3cae489',
      positionRouter: '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
    },
    {
      chain: 'avalanche',
      protocol: 'gmx',
      metric: DataMetrics.perpetual,
      birthday: 1639785600, // Sat Dec 18 2021 00:00:00 GMT+0000
      address: '0x9ab2de34a33fb459b538c43f251eb825645e8595',
      reader: '0x67b789D48c926006F5132BFCe4e976F0A7A63d5D',
      positionRouter: '0xffF6D276Bc37c61A23f06410Dce4A400f66420f8',
    },
  ]),
};
