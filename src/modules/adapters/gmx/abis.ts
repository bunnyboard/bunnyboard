export interface GmxEventInterfaces {
  IncreasePosition: string;
  DecreasePosition: string;
  LiquidatePosition: string;
  CollectMarginFees: string;
}

export const GmxEventSignatures: GmxEventInterfaces = {
  IncreasePosition: '0x2fe68525253654c21998f35787a8d0f361905ef647c854092430ab65f2f15022',
  DecreasePosition: '0x93d75d64d1f84fc6f430a64fc578bdd4c1e090e90ea2d51773e626d19de56d30',
  LiquidatePosition: '0x2e1f85a64a2f22cf2f0c42584e7c919ed4abe8d53675cff0f62bf1e95a1c676f',
  CollectMarginFees: '0x5d0c0019d3d45fadeb74eff9d2c9924d146d000ac6bcf3c28bf0ac3c9baa011a',
};
