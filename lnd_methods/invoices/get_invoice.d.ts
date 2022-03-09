import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetInvoiceArgs = AuthenticatedLightningArgs<{
  /** Payment Hash Id Hex String */
  id: string;
}>;

export type GetInvoiceResult = {
  /** Fallback Chain Address */
  chain_address?: string;
  /** CLTV Delta */
  cltv_delta: number;
  /** Settled at ISO 8601 Date */
  confirmed_at?: string;
  /** ISO 8601 Date */
  created_at: string;
  /** Description */
  description: string;
  /** Description Hash Hex String */
  description_hash?: string;
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
  /** Invoice is Private */
  is_private: boolean;
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
    /** HTLC CLTV Timeout Height Number */
    timeout: number;
    /** Payment Tokens */
    tokens: number;
  }[];
  /** Received Tokens */
  received: number;
  /** Received Millitokens */
  received_mtokens: string;
  /** Bolt 11 Invoice */
  request?: string;
  /** Secret Preimage Hex String */
  secret: string;
  /** Tokens */
  tokens: number;
};

/**
 * Lookup a channel invoice.
 * 
 * The received value and the invoiced value may differ as invoices may be
over-paid.
 *
 * Requires `invoices:read` permission
 * 
 * `payment` is not supported on LND 0.11.1 and below
 */
export const getInvoice: AuthenticatedLightningMethod<
  GetInvoiceArgs,
  GetInvoiceResult
>;
