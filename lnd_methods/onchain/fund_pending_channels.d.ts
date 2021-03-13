import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type FundPendingChannelsArgs = AuthenticatedLightningArgs<{
  /** Pending Channel Id Hex */
  channels: string[];
  /** Signed Funding Transaction PSBT Hex */
  funding: string;
}>;

/**
 * Fund pending channels
 *
 * Requires `offchain:write`, `onchain:write` permission
 */
export const fundPendingChannels: AuthenticatedLightningMethod<FundPendingChannelsArgs>;
