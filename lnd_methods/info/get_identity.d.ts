import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetIdentityResult = {
  /** Node Identity Public Key Hex String */
  public_key: string;
};

/**
 * Lookup the identity key for a node
 *
 * LND with `walletrpc` build tag and `address:read` permission is suggested
 *
 * Otherwise, `info:read` permission is require
 */
export const getIdentity: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetIdentityResult
>;
