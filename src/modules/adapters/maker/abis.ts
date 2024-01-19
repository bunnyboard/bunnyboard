export interface MakerEventInterfaces {
  Join: string;
  PsmJoin: string;
  Exit: string;

  AuthJoin: string;
  AuthExit: string;
}

export const MakerEventSignatures: MakerEventInterfaces = {
  Join: '0x3b4da69f00000000000000000000000000000000000000000000000000000000',
  Exit: '0xef693bed00000000000000000000000000000000000000000000000000000000',
  PsmJoin: '0xd14b1e4b00000000000000000000000000000000000000000000000000000000',
  AuthJoin: '0x16c03c2fe01ac285473b0d10ba5c5de59ede582fcac27a866b5827415fe44b03',
  AuthExit: '0x22d324652c93739755cf4581508b60875ebdd78c20c0cff5cf8e23452b299631',
};
