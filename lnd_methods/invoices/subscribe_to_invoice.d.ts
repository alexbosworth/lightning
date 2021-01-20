import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';

export type SubscribeToInvoiceArgs = AuthenticatedLightningArgs<{
  /** Invoice Payment Hash Hex String */
  id: string;
}>;

export type SubscribeToInvoiceInvoiceUpdatedEvent = {
  /** Fallback Chain Address */
  chain_address: string;
  /** Settled at ISO 8601 Date */
  confirmed_at?: string;
  /** ISO 8601 Date */
  created_at: string;
  /** Description */
  description: string;
  /** Description Hash Hex String */
  description_hash: string;
  /** ISO 8601 Date */
  expires_at: string;
  features: {
    /** BOLT 09 Feature Bit */
    bit: number;
    /** Feature is Known */
    is_known: boolean;
    /** Feature Support is Required To Pay */
    is_required: boolean;
    /** Feature Type */
    type: string;
  }[];
  /** Payment Hash */
  id: string;
  /** Invoice is Canceled */
  is_canceled?: boolean;
  /** Invoice is Confirmed */
  is_confirmed: boolean;
  /** HTLC is Held */
  is_held?: boolean;
  /** Invoice is Outgoing */
  is_outgoing: boolean;
  /** Invoice is Private */
  is_private: boolean;
  /** Invoiced Millitokens */
  mtokens: string;
  /**
   * Payment Identifying Secret Hex String
   *
   * not supported on LND 0.11.1 and below
   */
  payment?: string;
  payments: {
    /** Payment Settled At ISO 8601 Date */
    confirmed_at?: string;
    /** Payment Held Since ISO 860 Date */
    created_at: string;
    /** Payment Held Since Block Height */
    created_height: number;
    /** Incoming Payment Through Channel Id */
    in_channel: string;
    /** Payment is Canceled */
    is_canceled: boolean;
    /** Payment is Confirmed */
    is_confirmed: boolean;
    /** Payment is Held */
    is_held: boolean;
    messages: {
      /** Message Type number */
      type: string;
      /** Raw Value Hex String */
      value: string;
    }[];
    /** Incoming Payment Millitokens */
    mtokens: string;
    /** Pending Payment Channel HTLC Index */
    pending_index?: number;
    /** Payment Tokens */
    tokens: number;
  }[];
  /** Received Tokens */
  received: number;
  /** Received Millitokens */
  received_mtokens: string;
  /** Bolt 11 Invoice */
  request: string;
  routes: {
    /** Base Routing Fee In Millitokens */
    base_fee_mtokens: number;
    /** Standard Format Channel Id */
    channel: string;
    /** CLTV Blocks Delta */
    cltv_delta: number;
    /** Fee Rate In Millitokens Per Million */
    fee_rate: number;
    /** Public Key Hex String */
    public_key: string;
  }[][];
  /** Secret Preimage Hex String*/
  secret: string;
  /** Tokens */
  tokens: number;
};

/**
 * Subscribe to an invoice
 *
 * LND built with `invoicesrpc` tag is required
 *
 * Requires `invoices:read` permission
 *
 * `payment` is not supported on LND 0.11.1 and below
 */
export const subscribeToInvoice: AuthenticatedLightningSubscription<SubscribeToInvoiceArgs>;
