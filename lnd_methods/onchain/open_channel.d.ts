import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type ChannelOpenOptionsInput = {
  /** Fund With Unspent Transaction Id Hex String */
  transaction_id: string
  /** Fund With Unspent Transaction Output Index Number */
  transaction_vout: number
}

export type ChannelOpenOptions = {
  /** Routing Base Fee Millitokens Charged String */
  base_fee_mtokens?: string;
  /** Chain Fee Tokens Per VByte */
  chain_fee_tokens_per_vbyte?: number;
  /** Restrict Cooperative Close To Address */
  cooperative_close_address?: string;
  /** Immutable Channel Description */
  description?: string;
  /** Routing Fee Rate In Millitokens Per Million Number */
  fee_rate?: number;
  /** Tokens to Gift To Partner */
  give_tokens?: number;
  inputs?: ChannelOpenOptionsInput[]
  /** Allow Peer to Have Minimal Reserve Bool */
  is_allowing_minimal_reserve?: boolean;
  /** Use Maximal Chain Funds For Local Funding Bool */
  is_max_funding?: boolean;
  /** Channel is Private */
  is_private?: boolean;
  /** Create Simplified Taproot Type Channel */
  is_simplified_taproot?: boolean;
  /** Peer Should Avoid Waiting For Confirmation */
  is_trusted_funding?: boolean;
  /** Local Tokens */
  local_tokens: number;
  /** Spend UTXOs With Minimum Confirmations */
  min_confirmations?: number;
  /** Minimum HTLC Millitokens */
  min_htlc_mtokens?: string;
  /** Peer Output CSV Delay */
  partner_csv_delay?: number;
  /** Public Key Hex */
  partner_public_key: string;
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
 * `is_trusted_funding` is not supported on LND 0.15.0 and below and requires
 * `--protocol.option-scid-alias` and `--protocol.zero-conf` set on both sides
 * as well as a channel open request listener to accept the trusted funding.
 * 
 * `base_fee_mtokens` is not supported on LND 0.15.5 and below
 * `fee_rate` is not supported on LND 0.15.5 and below
 * 
 * `is_max_funding` is not supported on LND 0.16.4 and below
 * 
 * `description` is not supported on LND 0.16.4 and below
 * 
 * `inputs` is not supported on LND 0.16.4 and below
 */
export const openChannel: AuthenticatedLightningMethod<
  OpenChannelArgs,
  OpenChannelResult
>;
