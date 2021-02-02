import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetFeeRatesResult = {
  channels: {
    /** Base Flat Fee Tokens Rounded Up */
    base_fee: number;
    /** Base Flat Fee Millitokens */
    base_fee_mtokens: string;
    /** Standard Format Channel Id */
    id: string;
    /** Channel Funding Transaction Id Hex */
    transaction_id: string;
    /** Funding Outpoint Output Index */
    transaction_vout: number;
  }[];
};

/**
 * Get a rundown on fees for channels
 *
 * Requires `offchain:read` permission
 */
export const getFeeRates: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetFeeRatesResult
>;
