import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

export type GrantAccessArgs = AuthenticatedLightningArgs<{
  /** Macaroon Id Positive Numeric */
  id?: string;
  /** Can Add or Remove Peers */
  is_ok_to_adjust_peers?: boolean;
  /** Can Make New Addresses */
  is_ok_to_create_chain_addresses?: boolean;
  /** Can Create Lightning Invoices */
  is_ok_to_create_invoices?: boolean;
  /** Can Create Macaroons */
  is_ok_to_create_macaroons?: boolean;
  /** Can Derive Public Keys */
  is_ok_to_derive_keys?: boolean;
  /** Can List Access Ids */
  is_ok_to_get_access_ids?: boolean;
  /** Can See Chain Transactions */
  is_ok_to_get_chain_transactions?: boolean;
  /** Can See Invoices */
  is_ok_to_get_invoices?: boolean;
  /** Can General Graph and Wallet Information */
  is_ok_to_get_wallet_info?: boolean;
  /** Can Get Historical Lightning Transactions */
  is_ok_to_get_payments?: boolean;
  /** Can Get Node Peers Information */
  is_ok_to_get_peers?: boolean;
  /** Can Send Funds or Edit Lightning Payments */
  is_ok_to_pay?: boolean;
  /** Can Revoke Access Ids */
  is_ok_to_revoke_access_ids?: boolean;
  /** Can Send Coins On Chain */
  is_ok_to_send_to_chain_addresses?: boolean;
  /** Can Sign Bytes From Node Keys */
  is_ok_to_sign_bytes?: boolean;
  /** Can Sign Messages From Node Key */
  is_ok_to_sign_messages?: boolean;
  /** Can Terminate Node or Change Operation Mode */
  is_ok_to_stop_daemon?: boolean;
  /** Can Verify Signatures of Bytes */
  is_ok_to_verify_bytes_signatures?: boolean;
  /** Can Verify Messages From Node Keys */
  is_ok_to_verify_messages?: boolean;
  /** Method Name */
  methods?: string[];
  /** Entity:Action */
  permissions?: string[];
}>;

export type GrantAccessResult = {
  /** Base64 Encoded Macaroon */
  macaroon: string;
  /** Entity:Action */
  permissions: string[];
};

/**
 * Give access to the node by making a macaroon access credential
 * 
 * Specify `id` to allow for revoking future access
 *
 * Requires `macaroon:generate` permission
 *
 * Note: access once given cannot be revoked. Access is defined at the LND level
and version differences in LND can result in expanded access.
 *
 * Note: `id` is not supported in LND versions 0.11.0 and below
 */
export const grantAccess: AuthenticatedLightningMethod<
  GrantAccessArgs,
  GrantAccessResult
>;
