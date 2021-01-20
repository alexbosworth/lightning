import {AuthenticatedLightningSubscription} from '../../typescript';

export type SubscribeToInvoicesInvoiceUpdatedEvent = {
  /** Fallback Chain Address */
  chain_address?: string;
  /** Final CLTV Delta */
  cltv_delta: number;
  /** Confirmed At ISO 8601 Date */
  confirmed_at?: string;
  /** Created At ISO 8601 Date */
  created_at: string;
  /** Description */
  description: string;
  /** Description Hash Hex String */
  description_hash: string;
  /** Expires At ISO 8601 Date */
  expires_at: string;
  features: {
    /** Feature Bit */
    bit: number;
    /** Is Known Feature */
    is_known: boolean;
    /** Feature Is Required */
    is_required: boolean;
    /** Feature Name */
    name: string;
  }[];
  /** Invoice Payment Hash Hex String */
  id: string;
  /** Invoice is Confirmed */
  is_confirmed: boolean;
  /** Invoice is Outgoing */
  is_outgoing: boolean;
  /** Invoice is Push Payment */
  is_push?: boolean;
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
    /** Total Payment Millitokens */
    total_mtokens?: string;
  }[];
  /** Received Tokens */
  received: number;
  /** Received Millitokens */
  received_mtokens: string;
  /** BOLT 11 Payment Request */
  request?: string;
  /** Payment Secret Hex String */
  secret: string;
  /** Invoiced Tokens */
  tokens: number;
};

/**
 * Subscribe to invoices
 *
 * Requires `invoices:read` permission
 *
 * `payment` is not supported on LND 0.11.1 and below
 */
export const subscribeToInvoices: AuthenticatedLightningSubscription;
