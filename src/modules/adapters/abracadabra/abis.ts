export interface CauldronEventInterface {
  LogAddCollateral: string;
  LogRemoveCollateral: string;
  LogBorrow: string;
  LogRepay: string;
  LogLiquidation: string;
}

export const CauldronEventSignatures: CauldronEventInterface = {
  LogAddCollateral: '0x9ed03113de523cebfe5e49d5f8e12894b1c0d42ce805990461726444c90eab87',
  LogRemoveCollateral: '0x8ad4d3ff00da092c7ad9a573ea4f5f6a3dffc6712dc06d3f78f49b862297c402',
  LogBorrow: '0xb92cb6bca8e3270b9170930f03b17571e55791acdb1a0e9f339eec88bdb35e24',
  LogRepay: '0xc8e512d8f188ca059984b5853d2bf653da902696b8512785b182b2c813789a6e',
  LogLiquidation: '0x66b108dc29b952efc76dccea9b82dce6b59fab4d9af73d8dcc9789afcad5daf6',
};
