import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToForwardsForwardEvent = {
  /** Forward Update At ISO 8601 Date */
  at: string;
  /** Public Failure Reason */
  external_failure?: string;
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
  mtokens?: number;
  /** Outgoing Standard Format Channel Id */
  out_channel?: string;
  /** Outgoing Channel Payment Id */
  out_payment?: number;
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
