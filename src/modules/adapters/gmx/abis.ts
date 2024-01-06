export interface GmxEventInterfaces {
  BuyUSDG: string;
  SellUSDG: string;
  IncreasePosition: string;
  DecreasePosition: string;
  LiquidatePosition: string;

  // use to collect PnL data
  ClosePosition: string;
}

export const GmxEventSignatures: GmxEventInterfaces = {
  BuyUSDG: '0xab4c77c74cd32c85f35416cf03e7ce9e2d4387f7b7f2c1f4bf53daaecf8ea72d',
  SellUSDG: '0xd732b7828fa6cee72c285eac756fc66a7477e3dc22e22e7c432f1c265d40b483',
  IncreasePosition: '0x2fe68525253654c21998f35787a8d0f361905ef647c854092430ab65f2f15022',
  DecreasePosition: '0x93d75d64d1f84fc6f430a64fc578bdd4c1e090e90ea2d51773e626d19de56d30',
  LiquidatePosition: '0x2e1f85a64a2f22cf2f0c42584e7c919ed4abe8d53675cff0f62bf1e95a1c676f',
  ClosePosition: '0x73af1d417d82c240fdb6d319b34ad884487c6bf2845d98980cc52ad9171cb455',
};
