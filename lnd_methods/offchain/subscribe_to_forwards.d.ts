import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToForwardsForwardEvent = {
  /** Forward Update At ISO 8601 Date */
  at: string;
  /** Public Failure Reason */
  external_failure?: string;
  /** Fee Tokens Charged Number */
  fee?: number;
  /** Fee Millitokens Charged String */
  fee_mtokens?: string;
  /** Inbound Standard Format Channel Id */
  in_channel?: string;
  /** Inbound Channel Payment Id */
  in_payment?: number;
  /** Private Failure Reason */
  internal_failure?: string;
  /** Forward Is Confirmed */
  is_confirmed: boolean;
  /** Forward Is Failed */
  is_failed: boolean;
  /** Is Receive */
  is_receive: boolean;
  /** Is Send */
  is_send: boolean;
  /** Sending Millitokens */
  mtokens?: string;
  /** Outgoing Standard Format Channel Id */
  out_channel?: string;
  /** Outgoing Channel Payment Id */
  out_payment?: number;
  /** Settled Preimage Hex String */
  secret?: string
  /** Forward Timeout at Height */
  timeout?: number;
  /** Sending Tokens */
  tokens?: number;
};

/**
 * Subscribe to HTLC events
 *
 * Requires `offchain:read` permission
 */
export const subscribeToForwards: AuthenticatedLightningSubscription;
