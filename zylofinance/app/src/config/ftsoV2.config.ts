export const FTSOV2_CONFIG = {
  ADDRESS: "0x3d893C53D9e8056135C26C8c638B76C8b60Df726",
  RPC_URL: "https://coston2-api.flare.network/ext/C/rpc",
};

export const TOKENS = {
  USDT0: {
    address: "0xC1A5B41512496B80903D1f32d6dEa3a73212E71F",
    symbol: "USDT0",
  },
  FXRP: {
    address: "0x0b6A3645c240605887a5532109323A3E12273dc7",
    symbol: "FXRP",
  },
};

export const FEED_IDS = {
  "XRP/USD": "0x015852502f55534400000000000000000000000000",
  "FLR/USD": "0x01464c522f55534400000000000000000000000000",
} as const;

export type FeedId = keyof typeof FEED_IDS;
