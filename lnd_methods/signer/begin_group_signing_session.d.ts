import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type BeginGroupSigningSessionArgs = AuthenticatedLightningArgs<{
  /** Key Is BIP 86 Key Spend Key Bool */
  is_key_spend?: boolean;
  /** HD Seed Key Family Number */
  key_family: number;
  /** Key Index Number */
  key_index: number;
  /** External Public Key Hex String */
  public_keys: string[];
  /** Taproot Script Root Hash Hex String */
  root_hash?: string;
}>;

export type BeginGroupSigningSessionResult = {
  /** Final Script or Top Level Public Key Hex String */
  external_key: string;
  /** Session Id Hex String */
  id: string;
  /** Internal Top Level Public Key Hex String */
  internal_key?: string;
  /** Session Compound Nonces Hex String */
  nonce: string;
};

export const beginGroupSigningSession: AuthenticatedLightningMethod<
  BeginGroupSigningSessionArgs,
  BeginGroupSigningSessionResult
>;
