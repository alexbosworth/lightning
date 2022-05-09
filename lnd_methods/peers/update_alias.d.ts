import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript/shared';

export type UpdateAliasArgs = AuthenticatedLightningArgs<{
  /** Node Alias String */
  node: string;
}>;

export const updateAlias: AuthenticatedLightningMethod<UpdateAliasArgs>;
