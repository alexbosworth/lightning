import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  LightningMethod,
} from '../../typescript';

export type SubscribeToRpcRequestsArgs = AuthenticatedLightningArgs<{
  /** RPC Middleware Interception Name String */
  id?: string;
  /** Intercept Channel Closes Bool */
  is_intercepting_close_channel_requests?: boolean;
  /** Intercept Channel Opens Bool */
  is_intercepting_open_channel_requests?: boolean;
  /** Intercept Pay Via Route Bool */
  is_intercepting_pay_via_routes_requests?: boolean;
}>;

export type SubscribeToRpcRequestsResult = {
  /** RPC Request Subscription EventEmitter Object */
  subscription: NodeJS.EventEmitter;
};

export type SubscribeToRpcRequestsCommonEvent = {
  /** Message Id Number */
  id: number;
  /** Base64 Encoded Macaroon String */
  macaroon?: string;
  /** RPC URI String */
  uri?: string;
};

export type SubscribeToRpcRequestsEvent<TRequest> =
  Required<SubscribeToRpcRequestsCommonEvent> & {
    accept: LightningMethod;
    reject: LightningMethod<{
      /** Rejection String */
      message: string;
    }>;
    request: TRequest;
  };

/** A channel close request was intercepted: by default it will be rejected */
export type SubscribeToRpcRequestsCloseChannelRequestEvent =
  SubscribeToRpcRequestsEvent<{
    /** Request Sending Local Channel Funds To Address String */
    address?: string;
    /** Is Force Close Bool */
    is_force_close?: boolean;
    /** Confirmation Target Number */
    target_confirmations?: number;
    /** Tokens Per Virtual Byte Number */
    tokens_per_vbyte?: number;
    /** Transaction Id Hex String */
    transaction_id: string;
    /** Transaction Output Index Number */
    transaction_vout: number;
  }>;

/** A channel open request was intercepted: by default it will be rejected */
export type SubscribeToRpcRequestsOpenChannelRequestEvent =
  SubscribeToRpcRequestsEvent<{
    /** Chain Fee Tokens Per VByte Number */
    chain_fee_tokens_per_vbyte?: number;
    /** Prefer Cooperative Close To Address String */
    cooperative_close_address?: string;
    /** Tokens to Gift To Partner Number */
    give_tokens?: number;
    /** Channel is Private Bool */
    is_private?: boolean;
    /** Local Tokens Number */
    local_tokens: number;
    /** Spend UTXOs With Minimum Confirmations Number */
    min_confirmations?: number;
    /** Minimum HTLC Millitokens String */
    min_htlc_mtokens?: string;
    /** Public Key Hex String */
    partner_public_key: string;
    /** Peer Output CSV Delay Number */
    partner_csv_delay?: number;
  }>;

/** A pay to route request was intercepted: by default it will be rejected */
export type SubscribeToRpcRequestsPayViaRouteRequestEvent =
  SubscribeToRpcRequestsEvent<{
    /** Payment Hash Hex String */
    id: string;
    route: {
      /** Route Fee Tokens Number */
      fee: number;
      /** Route Fee Millitokens String */
      fee_mtokens: string;
      hops: {
        /** Standard Format Channel Id String */
        channel: string;
        /** Channel Capacity Tokens Number */
        channel_capacity: number;
        /** Fee Tokens Number */
        fee: number;
        /** Fee Millitokens String */
        fee_mtokens: string;
        /** Forward Tokens Number */
        forward: number;
        /** Forward Millitokens String */
        forward_mtokens: string;
        /** Forward Edge Public Key Hex String */
        public_key: string;
        /** Timeout Block Height Number */
        timeout?: number;
      }[];
      /** Total Fee-Inclusive Millitokens String */
      mtokens: string;
      /** Payment Identifier Hex String */
      payment?: string;
      /** Timeout Block Height Number */
      timeout?: number;
      /** Total Fee-Inclusive Tokens Number */
      tokens: number;
      /** Total Payment Millitokens String */
      total_mtokens?: string;
    };
  }>;

export type SubscribeToRpcRequestsRequestOrResponseEvent =
  SubscribeToRpcRequestsCommonEvent & {
    /** Call Id Number */
    call: number;
  };

export type SubscribeToRpcRequestsRequestEvent =
  SubscribeToRpcRequestsRequestOrResponseEvent;

export type SubscribeToRpcRequestsResponseEvent =
  SubscribeToRpcRequestsRequestOrResponseEvent;

/**
 * Subscribe to RPC requests and their responses
 *
 * `accept` and `reject` methods can be used with cbk or Promise syntax
 *
 * Requires `macaroon:write` permission
 *
 * LND must be running with "RPC middleware" enabled: `rpcmiddleware.enable=1`
 *
 * This method is not supported in LND 0.13.4 and below
 */
export const subscribeToRpcRequests: AuthenticatedLightningMethod<
  SubscribeToRpcRequestsArgs,
  SubscribeToRpcRequestsResult
>;
