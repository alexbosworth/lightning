import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetChannelArgs = AuthenticatedLightningArgs<{
  /** Standard Format Channel Id */
  id: string;
}>;

export type GetChannelResult = {
  /** Maximum Tokens */
  capacity: number;
  /** Standard Format Channel Id */
  id: string;
  policies: {
    /** Base Fee Millitokens */
    base_fee_mtokens?: string;
    /** Locktime Delta */
    cltv_delta?: number;
    /** Fees Charged Per Million Millitokens */
    fee_rate?: number;
    /** Channel Is Disabled */
    is_disabled?: boolean;
    /** Maximum HTLC Millitokens Value */
    max_htlc_mtokens?: string;
    /** Minimum HTLC Millitokens Value */
    min_htlc_mtokens?: string;
    /** Node Public Key */
    public_key: string;
    /** Policy Last Updated At ISO 8601 Date */
    updated_at?: string;
  }[];
  /** Transaction Id Hex */
  transaction_id: string;
  /** Transaction Output Index */
  transaction_vout: number;
  /** Last Update Epoch ISO 8601 Date */
  updated_at?: string;
};

/**
 * Get graph information about a channel on the network
 *
 * Requires `info:read` permission
 */
export const getChannel: AuthenticatedLightningMethod<
  GetChannelArgs,
  GetChannelResult
>;
