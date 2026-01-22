import {AuthenticatedTapdArgs, AuthenticatedTapdMethod} from '../../typescript/tapd_shared';

export type ListTaprootAssetBalancesArgs = AuthenticatedTapdArgs<{
  /** Asset ID Filter Buffer */
  asset_filter?: Buffer;
  /** Group By Asset ID or Group Key */
  group_by?: {asset_id: boolean} | {group_key: boolean};
  /** Group Key Filter Buffer */
  group_key_filter?: Buffer;
  /** Include Leased Assets */
  include_leased?: boolean;
  /** Script Key Type Query */
  script_key_type?: {
    explicit_type?: number;
    all_types?: boolean;
  };
}>;

export type ListTaprootAssetBalancesResult = {
  /** Asset Balances Grouped by Asset ID */
  asset_balances?: {
    asset_genesis: {
      /** Asset ID Hex String */
      asset_id: string;
      /** Asset Type Number */
      asset_type: number;
      /** Genesis Point String */
      genesis_point: string;
      /** Meta Hash Hex String */
      meta_hash: string;
      /** Asset Name String */
      name: string;
      /** Output Index Number */
      output_index: number;
    };
    /** Balance Number */
    balance: number;
    /** Group Key Hex String */
    group_key?: string;
  }[];
  /** Asset Group Balances Grouped by Group Key */
  asset_group_balances?: {
    /** Total Balance Number */
    balance: number;
    /** Group Key Hex String */
    group_key?: string;
  }[];
  /** Unconfirmed Transfer Count Number */
  unconfirmed_transfers: number;
};

export const listTaprootAssetBalances: AuthenticatedTapdMethod<
  ListTaprootAssetBalancesArgs,
  ListTaprootAssetBalancesResult
>;
