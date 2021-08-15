import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetTowerServerInfoArgs = AuthenticatedLightningArgs;

export type GetTowerServerInfoResult = {
  tower?: {
    /** Watchtower Server Public Key Hex String */
    public_key: string;
    /** Socket String */
    sockets: string[];
    /** Watchtower External URI String */
    uris: string[];
  };
};

/**
 * Get watchtower server info.
 *
 * This method requires LND built with `watchtowerrpc` build tag
 *
 * Requires `info:read` permission
 */
export const getTowerServerInfo: AuthenticatedLightningMethod<
  GetTowerServerInfoArgs,
  GetTowerServerInfoResult
>;
