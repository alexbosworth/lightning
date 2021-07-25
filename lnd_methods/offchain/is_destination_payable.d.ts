import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type IsDestinationPayableArgs = AuthenticatedLightningArgs<{
  /** Final CLTV Delta Number */
  cltv_delta?: number;
  /** Pay to Node with Public Key Hex String */
  destination: string;
  /** Pay Through Specific Final Hop Public Key Hex String */
  incoming_peer?: string;
  /** Maximum Fee Tokens To Pay Number */
  max_fee?: number;
  /** Maximum Fee Millitokens String */
  max_fee_mtokens?: string;
  /** Maximum Height of Payment Timeout Number */
  max_timeout_height?: number;
  /** Paying Millitokens String */
  mtokens?: string;
  /** Pay Out of Outgoing Standard Format Channel Id String */
  outgoing_channel?: string;
  /** Time to Spend Finding a Route Milliseconds Number */
  pathfinding_timeout?: number;
  routes?: {
    /** Base Routing Fee In Millitokens String */
    base_fee_mtokens?: string;
    /** Standard Format Channel Id String */
    channel?: string;
    /** CLTV Blocks Delta Number */
    cltv_delta?: number;
    /** Fee Rate In Millitokens Per Million Number */
    fee_rate?: number;
    /** Forward Edge Public Key Hex String */
    public_key: string;
  }[][];
  /** Paying Tokens Number */
  tokens?: number;
}>;

export type IsDestinationPayableResult = {
  /** Payment Is Successfully Tested Within Constraints Bool */
  is_payable: boolean;
};

/**
 * Determine if a payment destination is actually payable by probing it
 *
 * Requires `offchain:write` permission
 */
export const isDestinationPayable: AuthenticatedLightningMethod<
  IsDestinationPayableArgs,
  IsDestinationPayableResult
>;
