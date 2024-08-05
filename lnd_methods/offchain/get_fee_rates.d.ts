import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetFeeRatesResult = {
  channels: {
    /** Base Flat Fee Tokens Rounded Up */
    base_fee: number;
    /** Base Flat Fee Millitokens */
    base_fee_mtokens: string;
    /** Fee Rate in Millitokens Per Million Number */
    fee_rate: number;
    /** Standard Format Channel Id */
    id: string;
    /**
    * Source Based Base Fee Reduction String
    *
    * Not supported on LND 0.17.5 and below
    */
    inbound_base_discount_mtokens: string;
    /**
    * Source Based Per Million Rate Reduction Number
    *
    * Not supported on LND 0.17.5 and below
    */
    inbound_rate_discount: number;
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
