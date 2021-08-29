import {AuthenticatedLnd} from '../../lnd_grpc';
import {AuthenticatedLightningMethod} from '../../typescript';

export type GetChannelBalanceResult = {
  /** Channels Balance Tokens */
  channel_balance: number;
  /** Channels Balance Millitokens */
  channel_balance_mtokens?: string;
  /** Inbound Liquidity Tokens */
  inbound?: number;
  /** Inbound Liquidity Millitokens */
  inbound_mtokens?: string;
  /** Pending On-Chain Channels Balance Tokens */
  pending_balance: number;
  /** Pending On-Chain Inbound Liquidity Tokens */
  pending_inbound?: number;
  /** In-Flight Tokens */
  unsettled_balance?: number;
  /** In-Flight Millitokens */
  unsettled_balance_mtokens?: string;
};

/**
 * Get balance across channels.
 *
 * Requires `offchain:read` permission
 *
 * `channel_balance_mtokens` is not supported on LND 0.11.1 and below
 *
 * `inbound` and `inbound_mtokens` are not supported on LND 0.11.1 and below
 *
 * `pending_inbound` is not supported on LND 0.11.1 and below
 *
 * `unsettled_balance` is not supported on LND 0.11.1 and below
 *
 * `unsettled_balance_mtokens` is not supported on LND 0.11.1 and below
 */
export const getChannelBalance: AuthenticatedLightningMethod<
  {lnd: AuthenticatedLnd},
  GetChannelBalanceResult
>;
