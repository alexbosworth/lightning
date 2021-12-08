const {test} = require('@alexbosworth/tap');

const {pendingAsPendingChannels} = require('./../../lnd_responses');

const makeChannel = overrides => {
  const res = {
    capacity: '1',
    channel_point: `${Buffer.alloc(32).toString('hex')}:1`,
    commitment_type: 'STATIC_REMOTE_KEY',
    initiator: 'INITIATOR_REMOTE',
    local_balance: '1',
    local_chan_reserve_sat: '1',
    remote_balance: '1',
    remote_chan_reserve_sat: '1',
    remote_node_pub: Buffer.alloc(33).toString('hex'),
  };

  Object.keys(overrides || {}).forEach(key => res[key] = overrides[key]);

  return res;
};

const makePendingHtlc = overrides => {
  const res = {
    amount: '1',
    blocks_til_maturity: 1,
    incoming: true,
    maturity_height: 1,
    outpoint: `${Buffer.alloc(32).toString('hex')}:1`,
    stage: 1,
  };

  Object.keys(overrides || {}).forEach(key => res[key] = overrides[key]);

  return res;
};

const makePendingForceClosingChannel = overrides => {
  const res = {
    anchor: 'RECOVERED',
    blocks_til_maturity: 1,
    channel: makeChannel({}),
    closing_txid: Buffer.alloc(32).toString('hex'),
    limbo_balance: '1',
    maturity_height: 1,
    pending_htlcs: [makePendingHtlc({})],
    recovered_balance: '1',
  };

  Object.keys(overrides || {}).forEach(key => res[key] = overrides[key]);

  return res;
};

const makePendingOpenChannel = overrides => {
  const res = {
    channel: makeChannel({}),
    confirmation_height: 1,
    commit_fee: '1',
    commit_weight: '1',
    fee_per_kw: '1',
  };

  Object.keys(overrides || {}).forEach(key => res[key] = overrides[key]);

  return res;
};

const makeWaitingCloseChannel = overrides => {
  const res =  {
    channel: makeChannel({}),
    commitments: {
      local_commit_fee_sat: '1',
      local_txid: Buffer.alloc(32).toString('hex'),
      remote_commit_fee_sat: '1',
      remote_pending_commit_fee_sat: '1',
      remote_pending_txid: Buffer.alloc(32).toString('hex'),
      remote_txid: Buffer.alloc(32).toString('hex'),
    },
    limbo_balance: '1',
  };

  Object.keys(overrides || {}).forEach(key => res[key] = overrides[key]);

  return res;
}

const makeArgs = overrides => {
  const args = {
    pending_force_closing_channels: [makePendingForceClosingChannel({})],
    pending_open_channels: [makePendingOpenChannel({})],
    waiting_close_channels: [makeWaitingCloseChannel({})],
  };

  Object.keys(overrides || {}).forEach(key => args[key] = overrides[key]);

  return args;
};

const makeExpectedPending = overrides => {
  const res = {
    capacity: 1,
    close_transaction_id: Buffer.alloc(32).toString('hex'),
    is_active: false,
    is_closing: true,
    is_opening: false,
    is_partner_initiated: true,
    is_timelocked: true,
    local_balance: 1,
    local_reserve: 1,
    partner_public_key: Buffer.alloc(33).toString('hex'),
    pending_balance: 1,
    pending_payments: [{
      is_incoming: true,
      timelock_height: 1,
      tokens: 1,
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 1,
    }],
    received: 0,
    recovered_tokens: 1,
    remote_balance: 1,
    remote_reserve: 1,
    sent: 0,
    timelock_blocks: 1,
    timelock_expiration: 1,
    transaction_fee: 1,
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 1,
    transaction_weight: 1,
  };

  Object.keys(overrides || {}).forEach(key => res[key] = overrides[key]);

  return res;
};

const makeExpected = overrides => {
  const expected = {
    pending_channels: [
      makeExpectedPending({is_closing: false, is_opening: true}),
      makeExpectedPending({is_closing: false, is_opening: true}),
      makeExpectedPending({is_closing: false, is_opening: true}),
    ],
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    description: 'Pending channel details are expected',
    error: 'ExpectedPendingChannelResponse',
  },
  {
    args: {},
    description: 'Pending channels are expected to map',
    error: 'ExpectedPendingForceCloseChannels',
  },
  {
    args: makeArgs({pending_force_closing_channels: undefined}),
    description: 'Pending force closes are expected',
    error: 'ExpectedPendingForceCloseChannels',
  },
  {
    args: makeArgs({pending_open_channels: undefined}),
    description: 'Pending open channels are expected',
    error: 'ExpectedPendingOpenChannels',
  },
  {
    args: makeArgs({waiting_close_channels: undefined}),
    description: 'Waiting close channels are expected',
    error: 'ExpectedWaitingCloseChannels',
  },
  {
    args: makeArgs({pending_force_closing_channels: [null]}),
    description: 'A pending force close channel is expected',
    error: 'ExpectedPendingForceClosingChannel',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({channel: undefined}),
      ],
    }),
    description: 'A pending force close is expected to have a channel',
    error: 'ExpectedChannelInPendingForceClosingChannel',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({
          channel: makeChannel({channel_point: undefined}),
        }),
      ],
    }),
    description: 'A pending force channel is expected to have a channel point',
    error: 'ExpectedChannelPointInPendingForceClosingChannel',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({closing_txid: undefined}),
      ],
    }),
    description: 'A pending force channel is expected to have a close tx id',
    error: 'ExpectedPendingForceClosingTransactionId',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({limbo_balance: undefined}),
      ],
    }),
    description: 'A pending force channel is expected to have limbo balance',
    error: 'ExpectedLimboBalanceInPendingForceCloseTransaction',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({maturity_height: undefined}),
      ],
    }),
    description: 'A pending force channel is expected to have maturity height',
    error: 'ExpectedMaturityHeightInPendingForceCloseTransaction',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({pending_htlcs: undefined}),
      ],
    }),
    description: 'A pending force channel is expected to have pending htlcs',
    error: 'ExpectedArrayOfPendingHtlcsInPendingForceCloseTx',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({recovered_balance: undefined}),
      ],
    }),
    description: 'A force channel is expected to have recovered balance',
    error: 'ExpectedRecoveredBalanceAmountInPendingForceClose',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({pending_htlcs: [null]}),
      ],
    }),
    description: 'Pending htlcs array is expected to have htlcs',
    error: 'ExpectedPendingHtlcInForceClosePendingHtlcs',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({pending_htlcs: [
          makePendingHtlc({amount: undefined}),
        ]}),
      ],
    }),
    description: 'Pending htlcs are expected to have amounts',
    error: 'ExpectedPendingForceCloseHtlcAmount',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({pending_htlcs: [
          makePendingHtlc({incoming: undefined}),
        ]}),
      ],
    }),
    description: 'Pending htlcs are expected to have incoming',
    error: 'ExpectedPendingForceCloseHtlcIncomingStatus',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({pending_htlcs: [
          makePendingHtlc({maturity_height: undefined}),
        ]}),
      ],
    }),
    description: 'Pending htlcs are expected to have maturity height',
    error: 'ExpectedPendingForceCloseHtlcMaturityHeight',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({pending_htlcs: [
          makePendingHtlc({outpoint: undefined}),
        ]}),
      ],
    }),
    description: 'Pending htlcs are expected to have an outpoint',
    error: 'ExpectedHtlcOutpointInForceCloseHtlc',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({pending_htlcs: [
          makePendingHtlc({outpoint: ':'}),
        ]}),
      ],
    }),
    description: 'Pending htlcs are expected to have an outpoint tx id',
    error: 'ExpectedOutpointTransactionIdInPendingForceHtlc',
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [
        makePendingForceClosingChannel({pending_htlcs: [
          makePendingHtlc({outpoint: `${Buffer.alloc(32)}:`}),
        ]}),
      ],
    }),
    description: 'Pending htlcs are expected to have an outpoint tx vout',
    error: 'ExpectedOutpointOutputIndexInPendingForceHtlc',
  },
  {
    args: makeArgs({waiting_close_channels: [null]}),
    description: 'Waiting close channels are expected to be present',
    error: 'ExpectedPendingDetailsInWaitingCloseChannel',
  },
  {
    args: makeArgs({
      waiting_close_channels: [makeWaitingCloseChannel({channel: undefined})],
    }),
    description: 'Waiting close channels are expected to have a channel',
    error: 'ExpectedPendingChannelInWaitingCloseChannel',
  },
  {
    args: makeArgs({
      waiting_close_channels: [
        makeWaitingCloseChannel({
          channel: makeChannel({channel_point: undefined}),
        }),
      ],
    }),
    description: 'Waiting close channels are expected to have outpoints',
    error: 'ExpectedPendingChannelOutpointInWaitingCloseChannel',
  },
  {
    args: makeArgs({
      waiting_close_channels: [
        makeWaitingCloseChannel({limbo_balance: undefined}),
      ],
    }),
    description: 'Waiting close channels are expected to have a limbo balance',
    error: 'ExpectedLimboBalanceInWaitingCloseChannel',
  },
  {
    args: makeArgs({pending_open_channels: [null]}),
    description: 'Pending open channel details are expected',
    error: 'ExpectedPendingOpenChannelDetailsInPendingOpens',
  },
  {
    args: makeArgs({
      pending_open_channels: [makePendingOpenChannel({channel: undefined})],
    }),
    description: 'Pending open channel should have a channel',
    error: 'ExpectedChannelDetailsInPendingOpenChannel',
  },
  {
    args: makeArgs({
      pending_open_channels: [
        makePendingOpenChannel({
          channel: makeChannel({channel_point: undefined}),
        }),
      ],
    }),
    description: 'Pending open channel should have a channel outpoint',
    error: 'ExpectedChannelFundingOutpointInPendingOpenChannel',
  },
  {
    args: makeArgs({
      pending_open_channels: [makePendingOpenChannel({commit_fee: undefined})],
    }),
    description: 'Pending open channel should have a commit fee',
    error: 'ExpectedPendingOpenChannelCommitmentTransactionFee',
  },
  {
    args: makeArgs({
      pending_open_channels: [
        makePendingOpenChannel({commit_weight: undefined}),
      ],
    }),
    description: 'Pending open channel should have a commit weight',
    error: 'ExpectedPendingOpenChannelCommitmentTransactionWeight',
  },
  {
    args: makeArgs({}),
    description: 'Pending channels are mapped',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [],
      pending_open_channels: [makePendingOpenChannel({})],
      waiting_close_channels: [],
    }),
    description: 'Pending open channels are mapped',
    expected: makeExpected({
      pending_channels: [
        makeExpectedPending({
          close_transaction_id: undefined,
          is_closing: false,
          is_opening: true,
          is_timelocked: false,
          pending_balance: undefined,
          pending_payments: undefined,
          recovered_tokens: undefined,
          timelock_blocks: undefined,
          timelock_expiration: undefined,
        }),
      ],
    }),
  },
  {
    args: makeArgs({
      pending_force_closing_channels: [makePendingForceClosingChannel({})],
      pending_open_channels: [],
      waiting_close_channels: [],
    }),
    description: 'Pending channels are mapped',
    expected: makeExpected({
      pending_channels: [
        makeExpectedPending({transaction_fee: null, transaction_weight: null}),
      ],
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => pendingAsPendingChannels(args), new Error(error), 'Errors');
    } else {
      strictSame(pendingAsPendingChannels(args), expected, 'Pending mapped');
    }

    return end();
  });
});
