export const BungeeKnownBridgeNames: { [key: string]: string } = {
  // third parties
  '0x837ed841e30438f54fb6b0097c30a5c4f64b47545c3df655bcd6e44bb8991e37': 'hop',
  '0xc77ff9af68efffed7454e77fb54f8ff0ce78a7d153d8b300824b82b55aad654f': 'cbridge',
  '0xd36025cd509d584ab5657a1932f5097aa97e23f66deca532635f79998b4f0bce': 'hyphen',
  '0x709f58818bedd58450336213e1f2f6ff7405a2b1e594f64270a17b7e2249419c': 'across',
  '0x6debe1c49ff1a7d2012a7d55f3935c306a5eb673882f4edde41dbcaa58467fd1': 'stargate',
  '0xfb124487a9ad253606517a08816473db34d3f4319cda7e548f718d1bd7aec4f3': 'anyswap',
  '0x520b7e0fa71292fc3580658e9fcf097987149f9bab7aa0a213933370b9f02218': 'rainbow',
  '0xf8455f3379434a3ef6559858314c8f61d36412da9937cd3f1de59562deb078e6': 'cctp',
  '0x47443678ca5bb8034d5e764a6f20d6e5cfcbb4a3912e12f8bae660cd0face530': 'synapse',
  '0x6e6ef0d56d65c2193ef8da79bb1e0bac59c8ac17fdd0b3cc6122f82f7d42cc9d': 'connext',
  '0xea698b477c99ea804835b684c4c3009f282df52a6bf660d4006c72a3b60fd670': 'symbiosis',
  '0x0d2fea28d1562e741fbdf63c210c9b730d85f6504e95650096acf21f93afe549': 'refuel',

  // native bridges
  '0xf1c09a354cd800a13f6f260a3a96a0e33db28b0b53528072473336977bba34f4': 'polygonBridge',
  '0x2e27c951e4ed3f2f1e7771dd262432f093b6ddeabfca0688443958d00b9bcf56': 'optimismBridge',
  '0x2e760812e6696b561a918e71ad2845639638959ed846b188488dd0d8c0b953ef': 'zksyncBridge',
  '0x7c4e564b66172ccd4006719b3b9e6d8e4eabbc54c5cf017495bf6a3b3f4dd06f': 'gnosisBridge',
  '0x7da5d3610317b9820c1f9de12c4c257f3f0e2ea5b63c99f27ed8e0592ac8fb4c': 'arbitrumBridge',
  '0x86c029f16460117b4488dbcebd1ea3d4f22aee8859770297bc010a8caaa1b116': 'baseBridge',
};

// https://stargateprotocol.gitbook.io/stargate/developers/chain-ids
export const BungeeStargateChainIds: { [key: number]: string } = {
  101: 'ethereum',
  102: 'bnbchain',
  106: 'avalanche',
  109: 'polygon',
  110: 'arbitrum',
  111: 'optimism',
  112: 'fantom',
  151: 'metis',
  177: 'kava',
  181: 'mantle',
  183: 'linea',
  184: 'base',
};

export const BungeeEventSignatures = {
  SocketBridge: '0x74594da9e31ee4068e17809037db37db496702bf7d8d63afe6f97949277d1609',
};
