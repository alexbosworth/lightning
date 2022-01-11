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
 */
export const openChannels: AuthenticatedLightningMethod<
  OpenChannelsArgs,
  OpenChannelsResult
>;
