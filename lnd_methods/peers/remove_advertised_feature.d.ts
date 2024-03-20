import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type RemoveAdvertisedFeature = AuthenticatedLightningArgs<{
  /** BOLT 09 Feature Bit Number */
  feature: number;
}>;

/**
 * Remove an advertised feature from the graph node announcement
 *
 * Note: this method is not supported in LND versions 0.14.5 and below
 *
 * Requires LND built with `peersrpc` build tag
 *
 * Requires `peers:write` permissions
 */
export const removeAdvertisedFeature: AuthenticatedLightningMethod<RemoveAdvertisedFeature>;
