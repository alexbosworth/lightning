import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type CancelPendingChannelArgs = AuthenticatedLightningArgs<{
  /** Pending Channel Id Hex */
  id: string;
}>;

/**
 * Cancel an external funding pending channel
 */
export const cancelPendingChannel: AuthenticatedLightningMethod<CancelPendingChannelArgs>;
