import { ProtocolConfig } from '../types/configs';
import { AddressesBook, TokensBook } from './data';
import { Aavev2Configs, Aavev3Configs } from './protocols/aave';
import { CompoundConfigs, Compoundv3Configs } from './protocols/compound';
import { GmxConfigs, Gmxv2Configs } from './protocols/gmx';
import { IronbankConfigs } from './protocols/ironbank';
import { LiquityConfigs } from './protocols/liquity';
import { MakerConfigs } from './protocols/maker';
import { RadiantConfigs } from './protocols/radiant';
import { SonneConfigs } from './protocols/sonne';
import { SparkConfigs } from './protocols/spark';
import { VenusConfigs } from './protocols/venus';

export const DefaultQueryContractLogsBlockRange = 1000;
export const DefaultQueryRecordPerPage = 100;

export const DefaultMemcacheTime = 300; // 5 minutes

export const AddressList = AddressesBook;
export const TokenList = TokensBook;

export const ProtocolConfigs: { [key: string]: ProtocolConfig } = {
  aavev2: Aavev2Configs,
  aavev3: Aavev3Configs,
  compound: CompoundConfigs,
  compoundv3: Compoundv3Configs,
  ironbank: IronbankConfigs,
  venus: VenusConfigs,
  radiant: RadiantConfigs,
  sonne: SonneConfigs,
  liquity: LiquityConfigs,
  maker: MakerConfigs,
  spark: SparkConfigs,
  gmx: GmxConfigs,
  gmxv2: Gmxv2Configs,
};
