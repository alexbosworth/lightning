import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';
import {ScriptFromChainAddressArgs} from './script_from_chain_address';

type ExpectOutputScriptOrAddress = MergeExclusive<
  {
    /** Output Script AKA ScriptPub Hex */
    output_script: string;
  },
  ScriptFromChainAddressArgs
>;

export type SubscribeToChainSpendArgs = AuthenticatedLightningArgs<
  {
    /** Minimum Transaction Inclusion Blockchain Height */
    min_height: number;
    /** Blockchain Transaction Id Hex */
    transaction_id?: string;
    /** Blockchain Transaction Output Index */
    transaction_vout?: number;
  } & ExpectOutputScriptOrAddress
>;

export type SubscribeToChainSpendConfirmationEvent = {
  /** Confirmation Block Height */
  height: number;
  /** Raw Transaction Hex */
  transaction: string;
  /** Spend Outpoint Index */
  vin: number;
};

export type SubscribeToChainSpendReorgEvent = undefined;

/**
 * Subscribe to confirmations of a spend
 *
 * A chain address or raw output script is required
 *
 * Requires LND built with `chainrpc` build tag
 *
 * Requires `onchain:read` permission
 */
export const subscribeToChainSpend: AuthenticatedLightningSubscription<SubscribeToChainSpendArgs>;
