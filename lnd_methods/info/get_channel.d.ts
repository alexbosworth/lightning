import type {MergeExclusive} from 'type-fest';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  ChannelPolicy,
} from '../../typescript';

export type GetChannelArgs = AuthenticatedLightningArgs<
  MergeExclusive<
    {
      /** Standard Format Channel Id */
      id: string;
    },
    {
      /** Funding Outpoint Transaction Id Hex String */
      transaction_id: string;
      /** Funding Outpoint Transaction Output Index Number */
      transaction_vout: number;
    }
  >
>;

export type GetChannelResult = {
  /** Maximum Tokens */
  capacity: number;
  /** Standard Format Channel Id */
  id: string;
  policies: ChannelPolicy[];
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
 *
 * `inbound_base_discount_mtokens` is not supported on LND 0.17.5 and below
 *
 * `inbound_rate_discount` is not supported on LND 0.17.5 and below
 *
 * `transaction_id` is not supported on LND 0.18.0 and below
 *
 * `transaction_vout` is not supported on LND 0.18.0 and below
 */
export const getChannel: AuthenticatedLightningMethod<
  GetChannelArgs,
  GetChannelResult
>;
