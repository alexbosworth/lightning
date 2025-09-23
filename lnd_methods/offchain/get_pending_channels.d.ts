import {AuthenticatedLightningMethod} from "../../typescript";
import {AuthenticatedLnd} from "../../lnd_grpc";

export type GetPendingChannelsResult = {
	pending_channels: {
		/** Blocks Until Funding Expires */
		blocks_until_expiry?: number;
		/** Channel Capacity Tokens */
		capacity: number;
		/** Channel Closing Transaction */
		close_transaction?: string;
		/** Channel Closing Transaction Id */
		close_transaction_id?: string;
		/** Channel Description */
		description?: string;
		/** Channel Is Active */
		is_active: boolean;
		/** Channel Is Closing */
		is_closing: boolean;
		/** Channel Is Opening */
		is_opening: boolean;
		/** Channel Partner Initiated Channel */
		is_partner_initiated?: boolean;
		/** Channel Is Not Announced */
		is_private?: boolean;
		/** Channel Local Funds Constrained by Timelock */
		is_timelocked: boolean;
		/** Channel Local Tokens Balance */
		local_balance: number;
		/** Channel Local Reserved Tokens */
		local_reserve: number;
		/** Channel Peer Public Key */
		partner_public_key: string;
		/** Tokens Pending Recovery */
		pending_balance?: number;
		pending_payments?: {
			/** Payment Is Incoming */
			is_incoming: boolean;
			/** Payment Timelocked Until Height */
			timelock_height: number;
			/** Payment Tokens */
			tokens: number;
			/** Payment Transaction Id */
			transaction_id: string;
			/** Payment Transaction Vout */
			transaction_vout: number;
		}[];
		/** Tokens Received */
		received: number;
		/** Tokens Recovered From Close */
		recovered_tokens?: number;
		/** Remote Tokens Balance */
		remote_balance: number;
		/** Channel Remote Reserved Tokens */
		remote_reserve: number;
		/** Send Tokens */
		sent: number;
		/** Timelock Blocks Remaining */
		timelock_blocks?: number;
		/** Pending Tokens Block Height Timelock */
		timelock_expiration?: number;
		/** Funding Transaction Fee Tokens */
		transaction_fee?: number;
		/** Channel Funding Transaction Id */
		transaction_id: string;
		/** Channel Funding Transaction Vout */
		transaction_vout: number;
		/** Funding Transaction Weight */
		transaction_weight?: number;
		/** Channel Commitment Transaction Type */
		type?: string;
		/** Funding Seen At Best Block Height */
		opening_funding_height?: number;
		/** Open Activation Waiting Blocks Count */
		opening_waiting_blocks?: number;
	}[];
};

/**
 * Get pending channels.
 * 
 * Both `is_closing` and `is_opening` are returned as part of a channel because a
channel may be opening, closing, or active.
 * 
 * Requires `offchain:read` permission
 * 
 * `is_private` is not supported in LND 0.14.5 or before
 * 
 * `description` is not supported in LND 0.16.4 or before
 * 
 * `blocks_until_expiry` is not supported in LND 0.16.4 or before
 * 
 * `close_transaction` is not supported in LND 0.17.5 or before
 * 
 * `opening_funding_height` is not supported in LND 0.19.3 or before
 * 
 * `opening_waiting_blocks` is not supported in LND 0.19.3 or before
 */
export const getPendingChannels: AuthenticatedLightningMethod<
	{lnd: AuthenticatedLnd},
	GetPendingChannelsResult
>;
