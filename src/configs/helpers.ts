import { MetricConfig } from '../types/configs';
import { ProtocolConfigs } from './index';

export function getOldestBirthdayOfConfigs(): number {
  const configs: Array<MetricConfig> = [];

  for (const protocolConfig of Object.values(ProtocolConfigs)) {
    for (const config of protocolConfig.configs) {
      configs.push(config);
    }
  }

  let oldestTimestamp = configs.length > 0 ? configs[0].birthday : 0;
  for (const config of configs) {
    if (config.birthday < oldestTimestamp) {
      oldestTimestamp = config.birthday;
    }
  }

  return oldestTimestamp;
}
