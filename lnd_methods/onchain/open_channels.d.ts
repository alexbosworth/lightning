import type {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import type {ChannelOpenOptions} from './open_channel';

export type MultipleChannelOpenOptions = Pick<
  ChannelOpenOptions,
  | 'base_fee_mtokens'
  | 'cooperative_close_address'
  | 'fee_rate'
  | 'give_tokens'
  | 'is_private'
  | 'min_htlc_mtokens'
  | 'partner_public_key'
  | 'partner_csv_delay'
> & {
  /** Channel Capacity Tokens */
  capacity: number;
  /** Peer Should Avoid Waiting For Confirmation */
  is_trusted_funding?: boolean;
};

export type OpenChannelsArgs = AuthenticatedLightningArgs<{
  channels: MultipleChannelOpenOptions[];
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

 * `base_fee_mtokens` is not supported on LND 0.15.4 and below
 * `fee_rate` is not supported on LND 0.15.4 and below
 */
export const openChannels: AuthenticatedLightningMethod<
  OpenChannelsArgs,
  OpenChannelsResult
>;
