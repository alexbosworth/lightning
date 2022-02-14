import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GetMasterPublicKeysArgs = AuthenticatedLightningArgs;

export type GetMasterPublicKeysResult = {
  keys: {
    /** Key Derivation Path String> */
    derivation_path: string;
    /** Base58 Encoded Master Public Key String> */
    extended_public_key: string;
    /** Used External Keys Count Number> */
    external_key_count: number;
    /** Used Internal Keys Count Number> */
    internal_key_count: number;
    /** Node has Master Private Key Bool> */
    is_watch_only: boolean;
    /** Account Name String> */
    named: string;
  }[];
};

export const getMasterPublicKeys: AuthenticatedLightningMethod<
  GetMasterPublicKeysArgs,
  GetMasterPublicKeysResult
>;
