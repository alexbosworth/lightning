import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type ProposeChannelArgs = AuthenticatedLightningArgs<{
  /** Channel Capacity Tokens */
  capacity: number;
  /** Restrict Cooperative Close To Address */
  cooperative_close_address?: string;
  /** Cooperative Close Relative Delay */
  cooperative_close_delay?: number;
  /** Tokens to Gift To Partner */
  give_tokens?: number;
  /** Pending Channel Id Hex */
  id: string;
  /** Channel is Private */
  is_private?: boolean;
  /** Channel Funding Output MultiSig Local Key Index */
  key_index: number;
  /** Public Key Hex */
  partner_public_key: string;
  /** Channel Funding Partner MultiSig Public Key Hex */
  remote_key: string;
  /** Funding Output Transaction Id Hex */
  transaction_id: string;
  /** Funding Output Transaction Output Index */
  transaction_vout: number;
}>;

/**
 * Propose a new channel to a peer that prepared for the channel proposal
 * 
 * Channel proposals can allow for cooperative close delays or external funding
flows.
 *
 * Requires `address:read`, `offchain:write`, `onchain:write` permissions
 *
 * Requires LND compiled with `walletrpc` build tag
 */
export const proposeChannel: AuthenticatedLightningMethod<ProposeChannelArgs>;
