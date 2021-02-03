export type RouteFailureKeysArgs = {
  failure?: {
    channel_update: {
      /** Numeric Format Channel Id String */
      chan_id: string;
    };
  };
  route: {
    hops: {
      /** Standard Format Channel Id String */
      channel: string;
      /** Public Key Hex String */
      public_key: string;
    }[];
  };
};

export type RouteFailureKeysResult = {
  /** Public Key Hex String */
  keys?: string[];
};

export const routeFailureKeys: (
  args: RouteFailureKeysArgs
) => RouteFailureKeysResult;
