const anchorChannelType = 'ANCHORS';
const {isArray} = Array;
const remoteInitiator = 'INITIATOR_REMOTE';
const outpointSeparator = ':';

/** Derive pending channel details from a pending channels response

  {
    pending_force_closing_channels: [{
      anchor: <Anchor Status String>
      blocks_til_maturity: <Remaining Blocks to Timelock Height Number>
      channel: {
        capacity: <Channel Capacity Tokens Count String>
        channel_point: <Channel Outpoint String>
        commitment_type: <Type of Channel String>
        initiator: <Channel Creator Status String>
        local_balance: <Local Balance Tokens String>
        local_chan_reserve_sat: <Local Side Channel Reserve Tokens String>
        remote_balance: <Remote Balance Tokens String>
        remote_chan_reserve_sat: <Remote Side Channel Reserve Tokens String>
        remote_node_pub: <Remote Node Public Key Hex String>
      }
      closing_txid: <Closing Transaction Id Hex String>
      limbo_balance: <Tokens Waiting For Resolution String>
      maturity_height: <Timelock Height Number>
      pending_htlcs: [{
        amount: <Tokens Amount String>
        blocks_til_maturity: <Timelock Height Minus Current Height Number>
        incoming: <Is Incoming Bool>
        maturity_height: <Timelock Height Number>
        outpoint: <Commitment Transaction Outpoint String>
        stage: <Resolution Stage Number>
      }]
      recovered_balance: <Recovered Tokens Count String>
    }]
    pending_open_channels: [{
      channel: {
        capacity: <Channel Capacity Tokens Count String>
        channel_point: <Channel Outpoint String>
        commitment_type: <Type of Channel String>
        initiator: <Channel Creator Status String>
        local_balance: <Local Balance Tokens String>
        local_chan_reserve_sat: <Local Side Channel Reserve Tokens String>
        remote_balance: <Remote Balance Tokens String>
        remote_chan_reserve_sat: <Remote Side Channel Reserve Tokens String>
        remote_node_pub: <Remote Node Public Key Hex String>
      }
      confirmation_height: <Future Confirmation Height Number>
      commit_fee: <Commitment Transaction Fee Tokens String>
      commit_weight: <Commitment Transaction Weight Units String>
      fee_per_kw: <Fee Tokens Per Thousand Weight Units String>
    }]
    waiting_close_channels: [{
      channel: {
        capacity: <Channel Capacity Tokens Count String>
        channel_point: <Channel Outpoint String>
        commitment_type: <Type of Channel String>
        initiator: <Channel Creator Status String>
        local_balance: <Local Balance Tokens String>
        local_chan_reserve_sat: <Local Side Channel Reserve Tokens String>
        remote_balance: <Remote Balance Tokens String>
        remote_chan_reserve_sat: <Remote Side Channel Reserve Tokens String>
        remote_node_pub: <Remote Node Public Key Hex String>
      }
      commitments: {
        local_commit_fee_sat: <Local Commitment Transaction Fee Tokens String>
        local_txid: <Local Commitment Transaction Id Hex String>
        remote_commit_fee_sat: <Remote Commitment Fee Tokens String>
        remote_pending_commit_fee_sat: <Remote Pending Commitment Fee String>
        remote_pending_txid: <Remote Pending Commitment Tx Id Hex String>
        remote_txid: <Remote Commitment Transaction Id Hex String>
      }
      limbo_balance: <Tokens Waiting for Resolution String>
    }]
  }

  @throws
  <Error>

  @returns
  {
    pending_channels: [{
      capacity: <Channel Capacity Tokens Number>
      [close_transaction_id]: <Channel Closing Transaction Id String>
      is_active: <Channel Is Active Bool>
      is_closing: <Channel Is Closing Bool>
      is_opening: <Channel Is Opening Bool>
      is_partner_initiated: <Channel Partner Initiated Channel Bool>
      is_timelocked: <Channel Local Funds Constrained by Timelock Script Bool>
      local_balance: <Channel Local Tokens Balance Number>
      local_reserve: <Channel Local Reserved Tokens Number>
      partner_public_key: <Channel Peer Public Key String>
      [pending_balance]: <Tokens Pending Recovery Number>
      [pending_payments]: [{
        is_incoming: <Payment Is Incoming Bool>
        timelock_height: <Payment Timelocked Until Height Number>
        tokens: <Payment Tokens Number>
        transaction_id: <Payment Transaction Id String>
        transaction_vout: <Payment Transaction Vout Number>
      }]
      received: <Tokens Received Number>
      [recovered_tokens]: <Tokens Recovered From Close Number>
      remote_balance: <Remote Tokens Balance Number>
      remote_reserve: <Channel Remote Reserved Tokens Number>
      sent: <Send Tokens Number>
      [timelock_blocks]: <Timelock Blocks Remaining Number>
      [timelock_expiration]: <Pending Tokens Block Height Timelock Number>
      [transaction_fee]: <Commit Transaction Fee Tokens Number>
      transaction_id: <Channel Funding Transaction Id String>
      transaction_vout: <Channel Funding Transaction Vout Number>
      [transaction_weight]: <Commit Transaction Weight Number>
    }]
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedPendingChannelResponse');
  }

  if (!isArray(args.pending_force_closing_channels)) {
    throw new Error('ExpectedPendingForceCloseChannels');
  }

  if (!isArray(args.pending_open_channels)) {
    throw new Error('ExpectedPendingOpenChannels');
  }

  if (!isArray(args.waiting_close_channels)) {
    throw new Error('ExpectedWaitingCloseChannels');
  }

  const pendingForceClosingChannels = args.pending_force_closing_channels;

  const forceClosing = pendingForceClosingChannels.reduce((sum, pending) => {
    if (!pending) {
      throw new Error('ExpectedPendingForceClosingChannel');
    }

    if (!pending.channel) {
      throw new Error('ExpectedChannelInPendingForceClosingChannel');
    }

    if (!pending.channel.channel_point) {
      throw new Error('ExpectedChannelPointInPendingForceClosingChannel');
    }

    if (!pending.closing_txid) {
      throw new Error('ExpectedPendingForceClosingTransactionId');
    }

    if (!pending.limbo_balance) {
      throw new Error('ExpectedLimboBalanceInPendingForceCloseTransaction');
    }

    if (pending.maturity_height === undefined) {
      throw new Error('ExpectedMaturityHeightInPendingForceCloseTransaction');
    }

    if (!isArray(pending.pending_htlcs)) {
      throw new Error('ExpectedArrayOfPendingHtlcsInPendingForceCloseTx');
    }

    if (!pending.recovered_balance) {
      throw new Error('ExpectedRecoveredBalanceAmountInPendingForceClose');
    }

    sum[pending.channel.channel_point] = {
      close_transaction_id: pending.closing_txid,
      pending_balance: Number(pending.limbo_balance),
      pending_payments: pending.pending_htlcs.map(htlc => {
        if (!htlc) {
          throw new Error('ExpectedPendingHtlcInForceClosePendingHtlcs');
        }

        if (!htlc.amount) {
          throw new Error('ExpectedPendingForceCloseHtlcAmount');
        }

        if (htlc.incoming === undefined) {
          throw new Error('ExpectedPendingForceCloseHtlcIncomingStatus');
        }

        if (htlc.maturity_height === undefined) {
          throw new Error('ExpectedPendingForceCloseHtlcMaturityHeight');
        }

        if (!htlc.outpoint) {
          throw new Error('ExpectedHtlcOutpointInForceCloseHtlc');
        }

        const [txId, vout] = htlc.outpoint.split(outpointSeparator);

        if (!txId) {
          throw new Error('ExpectedOutpointTransactionIdInPendingForceHtlc');
        }

        if (!vout) {
          throw new Error('ExpectedOutpointOutputIndexInPendingForceHtlc');
        }

        return {
          is_incoming: htlc.incoming,
          timelock_height: htlc.maturity_height,
          tokens: Number(htlc.amount),
          transaction_id: txId,
          transaction_vout: Number(vout),
        };
      }),
      recovered_tokens: Number(pending.recovered_balance),
      timelock_blocks: pending.blocks_til_maturity,
      timelock_expiration: pending.maturity_height,
    };

    return sum;
  },
  {});

  const opening = args.pending_open_channels.reduce((sum, pending) => {
    if (!pending) {
      throw new Error('ExpectedPendingOpenChannelDetailsInPendingOpens');
    }

    if (!pending.channel) {
      throw new Error('ExpectedChannelDetailsInPendingOpenChannel');
    }

    if (!pending.channel.channel_point) {
      throw new Error('ExpectedChannelFundingOutpointInPendingOpenChannel');
    }

    if (!pending.commit_fee) {
      throw new Error('ExpectedPendingOpenChannelCommitmentTransactionFee');
    }

    if (!pending.commit_weight) {
      throw new Error('ExpectedPendingOpenChannelCommitmentTransactionWeight');
    }

    sum[pending.channel.channel_point] = {
      transaction_fee: Number(pending.commit_fee),
      transaction_weight: Number(pending.commit_weight),
    };

    return sum;
  },
  {});

  const waitClosing = args.waiting_close_channels.reduce((sum, pending) => {
    if (!pending) {
      throw new Error('ExpectedPendingDetailsInWaitingCloseChannel');
    }

    if (!pending.channel) {
      throw new Error('ExpectedPendingChannelInWaitingCloseChannel');
    }

    if (!pending.channel.channel_point) {
      throw new Error('ExpectedPendingChannelOutpointInWaitingCloseChannel');
    }

    if (!pending.limbo_balance) {
      throw new Error('ExpectedLimboBalanceInWaitingCloseChannel');
    }

    sum[pending.channel.channel_point] = {
      pending_balance: Number(pending.limbo_balance),
    };

    return sum;
  },
  {});

  const channels = []
    .concat(args.pending_force_closing_channels)
    .concat(args.pending_open_channels)
    .concat(args.waiting_close_channels)
    .map(({channel}) => channel);

  const pendingChannels = channels.map(channel => {
    const chanOpen = opening[channel.channel_point];
    const forced = forceClosing[channel.channel_point] || {};
    const [txId, vout] = channel.channel_point.split(outpointSeparator);
    const wait = waitClosing[channel.channel_point] || {};

    const endTx = forced.close_transaction_id;
    const pendingTokens = wait.pending_balance || forced.pending_balance;

    return {
      capacity: Number(channel.capacity),
      close_transaction_id: endTx || undefined,
      is_active: false,
      is_closing: !chanOpen,
      is_opening: !!chanOpen,
      is_partner_initiated: channel.initiator === remoteInitiator,
      is_timelocked: forced.timelock_blocks !== undefined,
      local_balance: Number(channel.local_balance),
      local_reserve: Number(channel.local_chan_reserve_sat),
      partner_public_key: channel.remote_node_pub,
      pending_balance: pendingTokens || undefined,
      pending_payments: forced.pending_payments || undefined,
      received: Number(),
      recovered_tokens: forced.recovered_tokens || undefined,
      remote_balance: Number(channel.remote_balance),
      remote_reserve: Number(channel.remote_chan_reserve_sat),
      sent: Number(),
      timelock_blocks: forced.timelock_blocks,
      timelock_expiration: forced.timelock_expiration || undefined,
      transaction_fee: !chanOpen ? null : chanOpen.transaction_fee,
      transaction_id: txId,
      transaction_vout: Number(vout),
      transaction_weight: !chanOpen ? null : chanOpen.transaction_weight,
    };
  });

  return {pending_channels: pendingChannels};
};
