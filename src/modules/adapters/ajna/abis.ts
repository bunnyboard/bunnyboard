export interface AjnaEventInterfaces {
  AddQuoteToken: string;
  RemoveQuoteToken: string;

  DrawDebt: string;
  RepayDebt: string;

  AddCollateral: string;
  RemoveCollateral: string;

  // Liquidation
  Take: string;
}

export const AjnaEventSignatures: AjnaEventInterfaces = {
  AddQuoteToken: '0x8b24a9808cf05d3d8e48ac09e4f649054994a88cfa657b3f4bf340b62137df1e',
  RemoveQuoteToken: '0x0130a7b525bd6b1e72def1ee0b77f3467028a0e958e30174a0c95eb3860fc221',

  DrawDebt: '0x49a2aab2f4f7ca5c6ba6d413b46a0a09d91d10188fd94b8e23c3225362d12b50',
  RepayDebt: '0xef9d6dc34b1e6893b8746b03ac07fd084909654a5cedab240265a8d1bd584dc2',

  AddCollateral: '0xa9387d09ded47dbc173eb751964c0c7b7e0a1165939b958fafc8109337597f94',
  RemoveCollateral: '0x90895bc82397742e0cea4685e72279103862a03bee6bbe1d71265c7aeb111527',

  Take: '0x4591b2dfbebff121b3ccd19ae2407e59a9cefd959b35e12d82752cb5bc6eb757',
};
