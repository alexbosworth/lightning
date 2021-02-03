import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToForwardRequestsForwardRequestEvent = {
  accept: () => void;
  /** Difference Between Out and In CLTV Height */
  cltv_delta: number;
  /** Routing Fee Tokens Rounded Down */
  fee: number;
  /** Routing Fee Millitokens */
  fee_mtokens: string;
  /** Payment Hash Hex */
  hash: string;
  /** Inbound Standard Format Channel Id */
  in_channel: string;
  /** Inbound Channel Payment Id */
  in_payment: number;
  messages: {
    /** Message Type number */
    type: string;
    /** Raw Value Hex */
    value: string;
  }[];
  /** Millitokens to Forward To Next Peer */
  mtokens: string;
  /** Hex Serialized Next-Hop Onion Packet To Forward */
  onion?: string;
  /** Requested Outbound Channel Standard Format Id */
  out_channel: string;
  /** Reject Forward */
  reject: () => void;
  /** Short Circuit */
  settle: (args: {secret: string}) => void;
  /** CLTV Timeout Height */
  timeout: number;
  /** Tokens to Forward to Next Peer Rounded Down */
  tokens: number;
};

/**
 * Subscribe to requests to forward payments
 * 
 * Note that the outbound channel is only the requested channel, another may be
selected internally to complete the forward.
 *
 * Requires `offchain:read`, `offchain:write` permission
 *
 * `onion` is not supported in LND 0.11.1 and below
 */
export const subscribeToForwardRequests: AuthenticatedLightningSubscription;
