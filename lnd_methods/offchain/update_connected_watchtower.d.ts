import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';

export type UpdateConnectedWatchtowerArgs = AuthenticatedLightningArgs<
  {
    /** Watchtower Public Key Hex String */
    public_key: string;
  } & MergeExclusive<
    {
      /** Add Socket String */
      add_socket: string;
    },
    {
      /** Remove Socket String */
      remove_socket: string;
    }
  >
>;

/**
 * Update a watchtower
 *
 * Requires LND built with `wtclientrpc` build tag
 *
 * Requires `offchain:write` permission
 */
export const updateConnectedWatchtower: AuthenticatedLightningMethod<UpdateConnectedWatchtowerArgs>;
