import EnvConfig from '../../configs/envConfig';
import {
  AdapterAbiConfigs,
  AdapterSaveAddressesOptions,
  GetAdapterDataStateOptions,
  GetAdapterDataStateResult,
  GetAdapterDataTimeframeOptions,
  GetAdapterDataTimeframeResult,
  GetAdapterEventLogsOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../types/collectors/options';
import { ProtocolConfig } from '../../types/configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly config: ProtocolConfig;
  public readonly abiConfigs: AdapterAbiConfigs;

  constructor(services: ContextServices, config: ProtocolConfig) {
    this.services = services;
    this.config = config;

    this.abiConfigs = {
      eventSignatures: {},
      eventAbis: {},
    };
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<GetAdapterDataStateResult> {
    return {
      crossLending: null,
      cdpLending: null,
    };
  }

  public async getDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<GetAdapterDataTimeframeResult> {
    return {
      crossLending: null,
      cdpLending: null,
    };
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    return [];
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    return {
      activities: [],
    };
  }

  public async saveAddresses(options: AdapterSaveAddressesOptions): Promise<void> {
    if (options.storages) {
      await options.storages.database.bulkWrite({
        collection: EnvConfig.mongodb.collections.addresses,
        operations: options.addresses
          .sort(function (a, b) {
            return a.timestamp > b.timestamp ? 1 : -1;
          })
          .map((address) => {
            return {
              updateOne: {
                filter: {
                  chain: address.chain,
                  protocol: address.protocol,
                  metric: address.metric,
                  address: address.address,
                },
                update: {
                  $set: {
                    ...address,
                  },
                  $setOnInsert: {
                    timeFirstSeen: address.timeFirstSeen,
                  },
                },
                upsert: true,
              },
            };
          }),
      });
    }
  }
}
