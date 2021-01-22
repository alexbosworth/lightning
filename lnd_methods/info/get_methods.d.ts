import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetMethodsResult = {
  methods: {
    /** Method Endpoint Path */
    endpoint: string;
    /** Entity:Action */
    permissions: string[];
  }[];
};

/**
 * Get the list of all methods and their associated requisite permissions
 *
 * Note: this method is not supported in LND versions 0.11.1 and below
 *
 * Requires `info:read` permission
 */
export const getMethods: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetMethodsResult
>;
