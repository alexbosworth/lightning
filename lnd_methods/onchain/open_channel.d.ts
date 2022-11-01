import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type ChannelOpenOptions = {
  /** Routing Base Fee Millitokens Charged String */
  base_fee_mtokens?: string;
  /** Chain Fee Tokens Per VByte */
  chain_fee_tokens_per_vbyte?: number;
  /** Restrict Cooperative Close To Address */
  cooperative_close_address?: string;
  /** Routing Fee Rate In Millitokens Per Million Number */
  fee_rate?: number;
  /** Tokens to Gift To Partner */
  give_tokens?: number;
  /** Channel is Private */
  is_private?: boolean;
  /** Local Tokens */
  local_tokens: number;
  /** Spend UTXOs With Minimum Confirmations */
  min_confirmations?: number;
  /** Minimum HTLC Millitokens */
  min_htlc_mtokens?: string;
  /** Public Key Hex */
  partner_public_key: string;
  /** Peer Output CSV Delay */
  partner_csv_delay?: number;
  /** Peer Connection Host:Port */
  partner_socket?: string;
};

export type OpenChannelArgs = AuthenticatedLightningArgs<ChannelOpenOptions>;

export type OpenChannelResult = {
  /** Funding Transaction Id */
  transaction_id: string;
  /** Funding Transaction Output Index */
  transaction_vout: number;
};

/**
 * Open a new channel.
 *
 * The capacity of the channel is set with local_tokens
 *
 * If give_tokens is set, it is a gift and it does not alter the capacity
 *
 * Requires `offchain:write`, `onchain:write`, `peers:write` permissions
 *
 * External funding requires LND compiled with `walletrpc` build tag
 *
 * `base_fee_mtokens` is not supported on LND 0.15.4 and below
 * `fee_rate` is not supported on LND 0.15.4 and below
 */
export const openChannel: AuthenticatedLightningMethod<
  OpenChannelArgs,
  OpenChannelResult
>;
