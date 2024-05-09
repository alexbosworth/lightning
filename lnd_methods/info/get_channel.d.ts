import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  ChannelPolicy,
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
 */
export const getChannel: AuthenticatedLightningMethod<
  GetChannelArgs,
  GetChannelResult
>;
