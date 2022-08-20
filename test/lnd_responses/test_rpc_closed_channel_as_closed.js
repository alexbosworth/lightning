const {test} = require('@alexbosworth/tap');

const {rpcClosedChannelAsClosed} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    alias_scids: [],
    capacity: '1',
    chan_id: '1',
    channel_point: '0102:0',
    close_height: 1,
    close_initiator: 'INITIATOR_LOCAL',
    close_type: 'LOCAL_FORCE_CLOSE',
    closing_tx_hash: '0304',
    open_initiator: 'INITIATOR_REMOTE',
    remote_pubkey: Buffer.alloc(33).toString('hex'),
    resolutions: [{
      amount_sat: '1',
      outcome: 'CLAIMED',
      outpoint: {
        output_index: 0,
        txid_str: Buffer.alloc(32).toString('hex'),
      },
      resolution_type: 'INCOMING_HTLC',
      sweep_txid: Buffer.alloc(32, 1).toString('hex'),
    }],
    settled_balance: '1',
    time_locked_balance: '1',
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    capacity: 1,
    close_balance_spent_by: undefined,
    close_balance_vout: undefined,
    close_confirm_height: 1,
    close_payments: [{
      is_outgoing: false,
      is_paid: true,
      is_pending: false,
      is_refunded: false,
      spent_by: '0101010101010101010101010101010101010101010101010101010101010101',
      tokens: 1,
      transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
      transaction_vout: 0,
    }],
    close_transaction_id: '0304',
    final_local_balance: 1,
    final_time_locked_balance: 1,
    id: '0x0x1',
    is_breach_close: false,
    is_cooperative_close: false,
    is_funding_cancel: false,
    is_local_force_close: true,
    is_partner_closed: false,
    is_partner_initiated: undefined,
    is_remote_force_close: false,
    other_ids: [],
    partner_public_key: Buffer.alloc(33).toString('hex'),
    transaction_id: '0102',
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: undefined,
    description: 'Channel close details expected',
    error: 'ExpectedChannelCloseDetailsToDeriveClosedChannel',
  },
  {
    args: makeArgs({alias_scids: undefined}),
    description: 'Alias scids are expected',
    error: 'ExpectedArrayOfAliasShortChannelIdsInClosedChannel',
  },
  {
    args: makeArgs({capacity: undefined}),
    description: 'Channel capacity is expected',
    error: 'ExpectedCloseChannelCapacity',
  },
  {
    args: makeArgs({chan_id: undefined}),
    description: 'A channel id is expected',
    error: 'ExpectedChannelIdOfClosedChannel',
  },
  {
    args: makeArgs({channel_point: undefined}),
    description: 'A channel outpoint is expected',
    error: 'ExpectedCloseChannelOutpoint',
  },
  {
    args: makeArgs({close_height: undefined}),
    description: 'A channel close out height is expected',
    error: 'ExpectedChannelCloseHeight',
  },
  {
    args: makeArgs({closing_tx_hash: undefined}),
    description: 'The tx id of the closing tx is expected',
    error: 'ExpectedClosingTransactionId',
  },
  {
    args: makeArgs({remote_pubkey: undefined}),
    description: 'The peer key of the channel is expected',
    error: 'ExpectedCloseRemotePublicKey',
  },
  {
    args: makeArgs({settled_balance: undefined}),
    description: 'The settled balance of the channel is expected',
    error: 'ExpectedFinalSettledBalance',
  },
  {
    args: makeArgs({time_locked_balance: undefined}),
    description: 'The timelocked balance of the channel is expected',
    error: 'ExpectedFinalTimeLockedBalanceForClosedChan',
  },
  {
    args: makeArgs({}),
    description: 'Local channel closed mapped to closed channel',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      alias_scids: ['2', '3'],
      zero_conf_confirmed_scid: '2',
    }),
    description: 'Alias scids are mapped to other ids',
    expected: makeExpected({id: '0x0x2', other_ids: ['0x0x3']}),
  },
  {
    args: makeArgs({
      close_initiator: 'REMOTE',
      close_type: 'REMOTE_FORCE_CLOSE',
      open_initiator: 'LOCAL',
    }),
    description: 'Local channel close remote close maps to closed channel',
    expected: makeExpected({
      is_local_force_close: false,
      is_partner_closed: true,
      is_partner_initiated: false,
      is_remote_force_close: true,
    }),
  },
  {
    args: makeArgs({close_initiator: 'LOCAL', open_initiator: 'REMOTE'}),
    description: 'Local channel close with remote open but local close maps',
    expected: makeExpected({is_partner_initiated: true}),
  },
  {
    args: makeArgs({
      chan_id: '0',
      close_height: 0,
      close_type: 'UNKNOWN',
      closing_tx_hash: Buffer.alloc(32).toString('hex'),
      resolutions: undefined,
    }),
    description: 'Empty values map to undefined attributes',
    expected: makeExpected({
      close_confirm_height: undefined,
      close_payments: [],
      close_transaction_id: undefined,
      id: undefined,
      is_local_force_close: false,
      is_partner_closed: undefined,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcClosedChannelAsClosed(args), new Error(error), 'Error');
    } else {
      const channel = rpcClosedChannelAsClosed(args);

      strictSame(channel, expected, 'Channel closed cast as close');
    }

    return end();
  });
});
