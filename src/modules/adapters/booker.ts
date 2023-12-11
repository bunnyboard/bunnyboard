// booker should be used by adapter
// to format and save data
import EnvConfig from '../../configs/envConfig';
import { normalizeAddress } from '../../lib/utils';
import { AddressBookEntryLending } from '../../types/domains/lending';
import { AddressBookEntryMasterchef } from '../../types/domains/masterchef';
import { ContextServices } from '../../types/namespaces';

export default class Booker {
  public readonly name: string = 'booker';
  public readonly services: ContextServices;

  constructor(services: ContextServices) {
    this.services = services;
  }

  public async saveAddressBookLending(options: AddressBookEntryLending): Promise<void> {
    const addressId = `${options.chain}-${normalizeAddress(options.address)}-${options.protocol}-${options.sector}-${
      options.market
    }-${options.token}-${options.role}`;
    await this.saveAddress(addressId, options);
  }

  public async saveAddressBookMasterchef(options: AddressBookEntryMasterchef): Promise<void> {
    const addressId = `${options.chain}-${normalizeAddress(options.address)}-${options.protocol}-${options.sector}-${
      options.masterchef
    }-${options.poolId}-${options.role}`;
    await this.saveAddress(addressId, options);
  }

  private async saveAddress(addressId: string, addressEntry: any): Promise<void> {
    const existed = await this.services.database.find({
      collection: EnvConfig.mongodb.collections.addressBook,
      query: {
        addressId: addressId,
      },
    });
    if (!existed) {
      await this.services.database.update({
        collection: EnvConfig.mongodb.collections.addressBook,
        keys: {
          addressId: addressId,
        },
        updates: {
          ...addressEntry,
        },
        upsert: true,
      });
    }
  }
}
