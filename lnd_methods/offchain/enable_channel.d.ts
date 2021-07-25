import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type EnableChannelArgs = AuthenticatedLightningArgs<{
  /** Force Channel Enabled Bool */
  is_force_enable?: boolean;
  /** Channel Funding Transaction Id Hex String */
  transaction_id: string;
  /** Channel Funding Transaction Output Index Number */
  transaction_vout: number;
}>;

/**
 * Mark a channel as enabled for outbound payments and forwards
 *
 * Setting `is_force_enable` will prevent future automated disabling/enabling
 *
 * Note: this method is not supported in LND versions 0.12.1 and below
 *
 * Requires `offchain:write` permission
 */
export const enableChannel: AuthenticatedLightningMethod<EnableChannelArgs>;
