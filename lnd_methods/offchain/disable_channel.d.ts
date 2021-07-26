import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type DisableChannelArgs = AuthenticatedLightningArgs<{
  /** Channel Funding Transaction Id Hex String */
  transaction_id: string;
  /** Channel Funding Transaction Output Index Number */
  transaction_vout: number;
}>;

/**
 * Mark a channel as temporarily disabled for outbound payments and forwards
 *
 * Note: this method is not supported in LND versions 0.12.1 and below
 *
 * Requires `offchain:write` permission
 */
export const disableChannel: AuthenticatedLightningMethod<DisableChannelArgs>;
