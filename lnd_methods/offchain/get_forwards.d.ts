import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
  PaginationArgs,
} from '../../typescript';

export type GetForwardsArgs = AuthenticatedLightningArgs<
  PaginationArgs & {
    /** Get Only Payments Forwarded At Or After ISO 8601 Date */
    after?: string;
    /** Get Only Payments Forwarded Before ISO 8601 Date */
    before?: string;
  }
>;

export type GetForwardsResult = {
  forwards: {
    /** Forward Record Created At ISO 8601 Date */
    created_at: string;
    /** Fee Tokens Charged */
    fee: number;
    /** Approximated Fee Millitokens Charged */
    fee_mtokens: string;
    /** Incoming Standard Format Channel Id */
    incoming_channel: string;
    /** Forwarded Millitokens */
    mtokens: string;
    /** Outgoing Standard Format Channel Id */
    outgoing_channel: string;
    /** Forwarded Tokens */
    tokens: number;
  }[];
  /** Continue With Opaque Paging Token */
  next?: string;
};

/**
 * Get forwarded payments, from oldest to newest
 *
 * When using an `after` date a `before` date is required.
 *
 * If a next token is returned, pass it to get additional page of results.
 *
 * Requires `offchain:read` permission
 */
export const getForwards: AuthenticatedLightningMethod<
  GetForwardsArgs,
  GetForwardsResult
>;
