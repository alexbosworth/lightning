import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type OpenChannelsArgs = AuthenticatedLightningArgs<{
  channels: {
    /** Channel Capacity Tokens */
    capacity: number;
    /** Restrict Coop Close To Address */
    cooperative_close_address?: string;
    /** Tokens to Gift To Partner */
    give_tokens?: number;
    /** Channel is Private */
    is_private?: boolean;
    /** Peer Should Avoid Waiting For Confirmation */
    is_trusted_funding?: boolean;
    /** Minimum HTLC Millitokens */
    min_htlc_mtokens?: string;
    /** Public Key Hex */
    partner_public_key: string;
    /** Peer Output CSV Delay */
    partner_csv_delay?: number;
  }[];
  /** Do not broadcast any channel funding transactions */
  is_avoiding_broadcast?: boolean;
}>;

export type OpenChannelsResult = {
  pending: {
    /** Address To Send To */
    address: string;
    /** Pending Channel Id Hex */
    id: string;
    /** Tokens to Send */
    tokens: number;
  }[];
};

/**
 * Open one or more channels
 *
 * Requires `offchain:write`, `onchain:write` permissions
 * 
 * After getting the addresses and tokens to fund, use `fundChannels` within ten
minutes to fund the channels.
 *
 * If you do not fund the channels, be sure to `cancelPendingChannel`s on each
channel that was not funded.

  Use `is_avoiding_broadcast` only when self-publishing the raw transaction
  after the funding step.

  `is_trusted_funding` is not supported on LND 0.15.0 and below and requires
  `--protocol.option-scid-alias` and `--protocol.zero-conf` set on both sides
  as well as a channel open request listener to accept the trusted funding.
 */
export const openChannels: AuthenticatedLightningMethod<
  OpenChannelsArgs,
  OpenChannelsResult
>;
