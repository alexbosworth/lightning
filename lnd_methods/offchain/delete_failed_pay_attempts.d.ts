import {AuthenticatedLightningMethod} from '../../typescript';

/**
 * Delete failed payment attempt records
 *
 * Requires `offchain:write` permission
 *
 * Method not supported on LND 0.12.1 or below
 */
export const deleteFailedPayAttempts: AuthenticatedLightningMethod;
