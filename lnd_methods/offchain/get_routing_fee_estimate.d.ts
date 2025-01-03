import {AuthenticatedLnd} from '../../lnd_grpc';
import {
    AuthenticatedLightningArgs,
    AuthenticatedLightningMethod
} from '../../typescript';

export type GetRoutingFeeEstimateRequest = AuthenticatedLightningArgs<{
    lnd: AuthenticatedLnd;
    /** BOLT 11 Encoded Payment Request */
    request: string;
    /** Optional Timeout in Milliseconds */
    timeout: number;
}>;

export type GetRoutingFeeEstimateResponse = {
    /** Sats (Routing Fee Sats) */
    fee: number;
    /** Timeout (Time Lock Delay) */
    timeout: string;
};

/**
 * Estimate routing fees based on an invoice.
 *
 * Requires `offchain:read` permission
 *
 * This method is not supported before LND 0.18.4
 */
export const getRoutingFeeEstimate: AuthenticatedLightningMethod<
  GetRoutingFeeEstimateRequest,
  GetRoutingFeeEstimateResponse
>;