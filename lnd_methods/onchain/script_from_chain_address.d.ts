import {MergeExclusive} from 'type-fest';

export type ScriptFromChainAddressArgs = MergeExclusive<
  {
    /** Address String */
    bech32_address: string;
  },
  MergeExclusive<
    {
      /** Address String */
      p2pkh_address: string;
    },
    {
      /** Address String */
      p2sh_address: string;
    }
  >
>;

export type ScriptFromChainAddressResult = {
  /** Output Script Hex String */
  script?: string;
};

/**
 * Derive output script from on-chain address
 */
export function scriptFromChainAddress(
  args: ScriptFromChainAddressArgs
): ScriptFromChainAddressResult;
