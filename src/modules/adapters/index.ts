import { BoardConfigs, ProtocolConfigs } from '../../configs';
import { ContextServices, IBoardAdapter, IProtocolAdapter } from '../../types/namespaces';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import CompoundAdapter from './compound/compound';
import Compoundv3Adapter from './compound/compoundv3';
import GmxAdapter from './gmx/gmx';
import LiquityAdapter from './liquity/liquity';
import MakerAdapter from './maker/maker';
import RadiantAdapter from './radiant/radiant';
import TokenBoardErc20Adapter from './tokenboard/erc20';
import VenusAdapter from './venus/venus';

export function getProtocolAdapters(services: ContextServices): { [key: string]: IProtocolAdapter } {
  return {
    aavev2: new Aavev2Adapter(services, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, ProtocolConfigs.aavev3),
    compound: new CompoundAdapter(services, ProtocolConfigs.compound),
    compoundv3: new Compoundv3Adapter(services, ProtocolConfigs.compoundv3),
    ironbank: new CompoundAdapter(services, ProtocolConfigs.ironbank),
    venus: new VenusAdapter(services, ProtocolConfigs.venus),
    radiant: new RadiantAdapter(services, ProtocolConfigs.radiant),
    sonne: new CompoundAdapter(services, ProtocolConfigs.sonne),
    spark: new Aavev3Adapter(services, ProtocolConfigs.spark),
    liquity: new LiquityAdapter(services, ProtocolConfigs.liquity),
    maker: new MakerAdapter(services, ProtocolConfigs.maker),
    gmx: new GmxAdapter(services, ProtocolConfigs.gmx),
  };
}

export function getBoardAdapters(services: ContextServices): { [key: string]: IBoardAdapter } {
  return {
    tokenboard: new TokenBoardErc20Adapter(services, BoardConfigs.tokenboard),
  };
}
