import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetEphemeralChannelIdsArgs = AuthenticatedLightningArgs;

export type GetEphemeralChannelIdsResult = {
  channels: {
    /** Channel Identifiers */
    other_ids: string[];
    /** Top Level Channel Identifier */
    reference_id: string;
  }[];
};

/**
 * Get ephemeral channel ids
 *
 * Requires `offchain:read` permission
 *
 * This method is not supported on LND 0.15.0 and below
 */
export const getEphemeralChannelIds: AuthenticatedLightningMethod<
  GetEphemeralChannelIdsArgs,
  GetEphemeralChannelIdsResult
>;
