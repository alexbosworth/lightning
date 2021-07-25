import {AuthenticatedLightningMethod} from '../../typescript';

/**
 * Delete all records of failed payments
 *
 * Requires `offchain:write` permission
 *
 * Method not supported on LND 0.12.1 or below
 */
export const deleteFailedPayments: AuthenticatedLightningMethod;
