const {test} = require('@alexbosworth/tap');

const {rpcChannelClosedAsClosed} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    capacity: '1',
    chan_id: 1,
    chan_point: {
      funding_txid_bytes: Buffer.from('0102', 'hex'),
      output_index: 1,
    },
    closed_height: 1,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    capacity: 1,
    close_height: 1,
    id: '0x0x1',
    transaction_id: '0201',
    transaction_vout: 1,
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: undefined,
    description: 'An update is expected',
    error: 'ExpectedChannelClosedUpdateDetails',
  },
  {
    args: makeArgs({capacity: undefined}),
    description: 'Channel capacity is expected',
    error: 'ExpectedChanCapacity',
  },
  {
    args: makeArgs({chan_id: undefined}),
    description: 'Channel id is expected',
    error: 'ExpectedChannelId',
  },
  {
    args: makeArgs({chan_id: 'chan_id'}),
    description: 'Valid channel id is expected',
    error: 'ExpectedValidChannelId',
  },
  {
    args: makeArgs({chan_point: undefined}),
    description: 'Channel funding outpoint is expected',
    error: 'ExpectedChanOutpoint',
  },
  {
    args: makeArgs({chan_point: {}}),
    description: 'Channel funding outpoint tx id is expected',
    error: 'ExpectedChannelTxId',
  },
  {
    args: makeArgs({chan_point: {funding_txid_bytes: Buffer.alloc(32)}}),
    description: 'Channel funding outpoint tx vout is expected',
    error: 'ExpectedChanPointVout',
  },
  {
    args: makeArgs({closed_height: undefined}),
    description: 'Closed height is expected',
    error: 'ExpectedCloseHeight',
  },
  {
    args: makeArgs({}),
    description: 'RPC channel closed is mapped to closed',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      capacity: '0',
      chan_point: {funding_txid_bytes: Buffer.alloc(32), output_index: 0},
    }),
    description: 'RPC channel closed without details is mapped to update',
    expected: makeExpected({
      capacity: undefined,
      transaction_id: undefined,
      transaction_vout: undefined,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcChannelClosedAsClosed(args), new Error(error), 'Error');
    } else {
      const update = rpcChannelClosedAsClosed(args);

      equal(!!update.updated_at, true, 'Has last updated date');

      delete update.updated_at;

      strictSame(update, expected, 'Channel closed cast as close');
    }

    return end();
  });
});
