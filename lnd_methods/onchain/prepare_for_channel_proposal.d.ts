import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type PrepareForChannelProposalArgs = AuthenticatedLightningArgs<{
  /** Cooperative Close Relative Delay */
  cooperative_close_delay?: number;
  /** Pending Id Hex */
  id?: string;
  /** Channel Funding Output Multisig Local Key Index */
  key_index: number;
  /** Channel Funding Partner Multisig Public Key Hex */
  remote_key: string;
  /** Funding Output Transaction Id Hex */
  transaction_id: string;
  /** Funding Output Transaction Output Index */
  transaction_vout: number;
}>;

export type PrepareForChannelProposalResult = {
  /** Pending Channel Id Hex */
  id: string;
};

/**
 * Prepare for a channel proposal
 * 
 * Channel proposals can be made with `propose_channel`. Channel proposals can
allow for cooperative close delays or external funding flows.
 *
 * Requires `offchain:write`, `onchain:write` permissions
 */
export const prepareForChannelProposal: AuthenticatedLightningMethod<
  PrepareForChannelProposalArgs,
  PrepareForChannelProposalResult
>;
