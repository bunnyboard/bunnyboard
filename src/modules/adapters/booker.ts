// booker should be used by adapter
// to format and save data
import EnvConfig from '../../configs/envConfig';
import { normalizeAddress } from '../../lib/utils';
import { AddressBookEntry } from '../../types/domains';
import { ContextServices } from '../../types/namespaces';

export interface AddressBookLendingOptions extends AddressBookEntry {
  marketAddress: string;
  tokenAddress: string;
}

export interface AddressBookMasterchefOptions extends AddressBookEntry {
  masterchef: string;
  poolId: number;
}

export default class Booker {
  public readonly name: string = 'booker';
  public readonly services: ContextServices;

  constructor(services: ContextServices) {
    this.services = services;
  }

  public async saveAddressBookLending(options: AddressBookLendingOptions): Promise<void> {
    const addressId = `${options.chain}-${normalizeAddress(options.address)}-${options.protocol}-${
      options.marketAddress
    }-${options.tokenAddress}-${options.role}`;
    await this.saveAddressBook({
      addressId: addressId,
      chain: options.chain,
      protocol: options.protocol,
      address: options.address,
      role: options.role,
      firstTime: options.firstTime,
    });
  }

  public async saveAddressBookMasterchef(options: AddressBookMasterchefOptions): Promise<void> {
    const addressId = `${options.chain}-${normalizeAddress(options.address)}-${options.protocol}-${
      options.masterchef
    }-${options.poolId}-${options.role}`;
    await this.saveAddressBook({
      addressId: addressId,
      chain: options.chain,
      protocol: options.protocol,
      address: options.address,
      role: options.role,
      firstTime: options.firstTime,
    });
  }

  private async saveAddressBook(options: AddressBookEntry) {
    const existed = await this.services.database.find({
      collection: EnvConfig.mongodb.collections.addressBook,
      query: {
        addressId: options.addressId,
      },
    });
    if (!existed) {
      await this.services.database.update({
        collection: EnvConfig.mongodb.collections.addressBook,
        keys: {
          addressId: options.addressId,
        },
        updates: {
          ...options,
        },
        upsert: true,
      });
      // logger.info('saved new address snapshot', {
      //   service: this.name,
      //   protocol: options.protocol,
      //   address: options.address,
      //   role: options.role,
      // });
    }
  }
}
