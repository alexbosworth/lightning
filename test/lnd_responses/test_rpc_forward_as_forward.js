const {test} = require('@alexbosworth/tap');

const {rpcForwardAsForward} = require('./../../lnd_responses');

const makeForward = override => {
  const forward = {
    amt_in: '2',
    amt_in_msat: '2000',
    amt_out: '1',
    amt_out_msat: '1000',
    chan_id_in: '1',
    chan_id_out: '2',
    fee: '1',
    fee_msat: '1000',
    timestamp: '1',
    timestamp_ns: '1000000000',
  };

  Object.keys(override).forEach(key => forward[key] = override[key]);

  return forward;
};

const tests = [
  {
    args: null,
    description: 'An rpc forward is expected to map to a forward',
    error: 'ExpectedRpcForwardToDeriveForward',
  },
  {
    args: makeForward({amt_in: undefined}),
    description: 'Amount in is expected',
    error: 'ExpectedIncomingForwardAmount',
  },
  {
    args: makeForward({amt_out: undefined}),
    description: 'Amount out is expected',
    error: 'ExpectedOutgoingForwardAmount',
  },
  {
    args: makeForward({chan_id_in: undefined}),
    description: 'Inbound channel id is expected',
    error: 'ExpectedForwardChannelInId',
  },
  {
    args: makeForward({chan_id_in: 'foo'}),
    description: 'Valid inbound channel id is expected',
    error: 'ExpectedNumericIncomingChannelId',
  },
  {
    args: makeForward({chan_id_out: undefined}),
    description: 'Outbound channel id is expected',
    error: 'ExpectedForwardChannelOutId',
  },
  {
    args: makeForward({chan_id_out: 'foo'}),
    description: 'Valid outbound channel id is expected',
    error: 'ExpectedNumericOutgoingChannelId',
  },
  {
    args: makeForward({fee: undefined}),
    description: 'A forwarding fee is expected',
    error: 'ExpectedForwardFeeValue',
  },
  {
    args: makeForward({timestamp: undefined}),
    description: 'A forward timestamp is expected',
    error: 'ExpectedTimestampForForwardEvent',
  },
  {
    args: makeForward({timestamp_ns: undefined}),
    description: 'A forward timestamp in ns is expected',
    error: 'ExpectedTimestampNanosecondsForForwardEvent',
  },
  {
    args: makeForward({}),
    description: 'An RPC forward is mapped to a forward',
    expected: {
      created_at: '1970-01-01T00:00:01.000Z',
      fee: 1,
      fee_mtokens: '1000',
      incoming_channel: '0x0x1',
      mtokens: '1000',
      outgoing_channel: '0x0x2',
      tokens: 1,
    },
  },
  {
    args: makeForward({timestamp_ns: '0'}),
    description: 'An RPC forward without ns is mapped to a forward',
    expected: {
      created_at: '1970-01-01T00:00:01.000Z',
      fee: 1,
      fee_mtokens: '1000',
      incoming_channel: '0x0x1',
      mtokens: '1000',
      outgoing_channel: '0x0x2',
      tokens: 1,
    },
  },
  {
    args: makeForward({fee: '0', fee_msat: '0'}),
    description: 'An RPC forward is mapped to a forward without fee mtokens',
    expected: {
      created_at: '1970-01-01T00:00:01.000Z',
      fee: 0,
      fee_mtokens: '0',
      incoming_channel: '0x0x1',
      mtokens: '1000',
      outgoing_channel: '0x0x2',
      tokens: 1,
    },
  },
  {
    args: makeForward({amt_out_msat: '0'}),
    description: 'An RPC forward is mapped to a forward without mtokens',
    expected: {
      created_at: '1970-01-01T00:00:01.000Z',
      fee: 1,
      fee_mtokens: '1000',
      incoming_channel: '0x0x1',
      mtokens: '0',
      outgoing_channel: '0x0x2',
      tokens: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcForwardAsForward(args), new Error(error), 'Got error');
    } else {
      const forward = rpcForwardAsForward(args);

      strictSame(forward, expected, 'Got expected forward details');
    }

    return end();
  });
});
