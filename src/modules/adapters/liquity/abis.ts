export interface LiquityEventInterfaces {
  TroveUpdated: string; // on borrow operation
  LUSDBorrowingFeePaid: string; // on borrow operation
  TroveLiquidated: string; // on trove manager
}

export const LiquityEventSignatures: LiquityEventInterfaces = {
  TroveUpdated: '0xc3770d654ed33aeea6bf11ac8ef05d02a6a04ed4686dd2f624d853bbec43cc8b',
  LUSDBorrowingFeePaid: '0xa55c5f48fd29482ad55f4b59bf070cd1ac1a7132a31f7a136ebe8877ae37e1ff',
  TroveLiquidated: '0xea67486ed7ebe3eea8ab3390efd4a3c8aae48be5bea27df104a8af786c408434',
};
