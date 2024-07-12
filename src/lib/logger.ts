import winston from 'winston';

import EnvConfig from '../configs/envConfig';
import { AxiosError } from 'axios';

const customFormat = winston.format.printf((entry: any) => {
  let propsLine = '';

  for (const [key, value] of Object.entries(entry)) {
    if (['timestamp', 'service', 'level', 'message'].indexOf(key) === -1) {
      propsLine += `${key}=${value} `;
    }
  }

  const service = entry.service ? entry.service : 'unknown';

  return `${entry.timestamp} ${entry.level.padEnd(5)} ${(service + ': ' + entry.message).padEnd(60)} ${
    propsLine.length > 0 ? propsLine.slice(0, -1) : ''
  }`;
});

const logger = winston.createLogger({
  level: EnvConfig.env.debug ? 'debug' : 'info',
  format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), customFormat),
  transports: [new winston.transports.Console({})],
});

// extension
export function logAxiosError(error: AxiosError) {
  console.log('axios request error');
  console.log(error.config ? error.config.url : '');
  console.log(error.response ? error.response.status : '', error.response ? error.response.statusText : '');
  console.log(error.response && error.response.data ? error.response.statusText : '');
}

export default logger;
