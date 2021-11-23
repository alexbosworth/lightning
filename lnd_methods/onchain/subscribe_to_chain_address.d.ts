import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningSubscription,
} from '../../typescript';
import {MergeExclusive} from 'type-fest';
import {ScriptFromChainAddressArgs} from './script_from_chain_address';

type ExpectedChainAddressToSubscribeForConfirmationEvents = MergeExclusive<
  {
    /** Output Script Hex */
    output_script: string;
  },
  ScriptFromChainAddressArgs
>;

export type SubscribeToChainAddressArgs = AuthenticatedLightningArgs<
  {
    /** Minimum Confirmations */
    min_confirmations?: number;
    /** Minimum Transaction Inclusion Blockchain Height */
    min_height: number;
    /** Blockchain Transaction Id */
    transaction_id?: string;
  } & ExpectedChainAddressToSubscribeForConfirmationEvents
>;

export type SubscribeToChainAddressConfirmationEvent = {
  /** Block Hash Hex */
  block: string;
  /** Block Best Chain Height */
  height: number;
  /** Raw Transaction Hex */
  transaction: string;
};

export type SubscribeToChainAddressReorgEvent = undefined;

/**
 * Subscribe to confirmation details about transactions sent to an address
 *
 * One and only one chain address or output script is required
 *
 * Requires LND built with `chainrpc` build tag
 *
 * Requires `onchain:read` permission
 */
export const subscribeToChainAddress: AuthenticatedLightningSubscription<SubscribeToChainAddressArgs>;
