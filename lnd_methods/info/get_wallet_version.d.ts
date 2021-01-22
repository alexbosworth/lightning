import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetWalletVersionResult = {
  /** Build Tag */
  build_tags: string[];
  /** Commit SHA1 160 Bit Hash Hex */
  commit_hash: string;
  /** Is Autopilot RPC Enabled */
  is_autopilotrpc_enabled: boolean;
  /** Is Chain RPC Enabled */
  is_chainrpc_enabled: boolean;
  /** Is Invoices RPC Enabled */
  is_invoicesrpc_enabled: boolean;
  /** Is Sign RPC Enabled */
  is_signrpc_enabled: boolean;
  /** Is Wallet RPC Enabled */
  is_walletrpc_enabled: boolean;
  /** Is Watchtower Server RPC Enabled */
  is_watchtowerrpc_enabled: boolean;
  /** Is Watchtower Client RPC Enabled */
  is_wtclientrpc_enabled: boolean;
  /** Recognized LND Version */
  version?: string;
};

/**
 * Get wallet version
 *
 * Tags are self-reported by LND and are not guaranteed to be accurate
 *
 * Requires `info:read` permission
 */
export const getWalletVersion: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetWalletVersionResult
>;
