const {test} = require('@alexbosworth/tap');

const {rpcForwardAsForwardRequest} = require('./../../lnd_responses');

const makeForward = override => {
  const forward = {
    custom_records: {
      '\u0010\u0000\u0000\u0000\u0000\u0000\u0000\u0000': Buffer.alloc(1, 1),
    },
    incoming_amount_msat: '2',
    incoming_circuit_key: {chan_id: '1', htlc_id: 0},
    incoming_expiry: 2,
    outgoing_amount_msat: '1',
    outgoing_expiry: 1,
    outgoing_requested_chan_id: '2',
    payment_hash: Buffer.alloc(32),
  };

  Object.keys(override).forEach(key => forward[key] = override[key]);

  return forward;
};

const tests = [
  {
    args: null,
    description: 'An rpc forward request is expected',
    error: 'ExpectedRpcForwardRequestToMapToForwardRequest',
  },
  {
    args: makeForward({custom_records: undefined}),
    description: 'Custom records are expected',
    error: 'ExpectedCustomRecordsInRpcForwardRequest',
  },
  {
    args: makeForward({incoming_amount_msat: undefined}),
    description: 'Incoming amount is expected',
    error: 'ExpectedIncomingAmountMillitokensInRpcForwardRequest',
  },
  {
    args: makeForward({incoming_circuit_key: undefined}),
    description: 'An inbound channel and index are expected',
    error: 'ExpectedInboundChannelDetailsInRpcForwardRequest',
  },
  {
    args: makeForward({incoming_circuit_key: {htlc_id: 0}}),
    description: 'An inbound channel is expected',
    error: 'ExpectedInboundChannelIdInRpcForwardRequest',
  },
  {
    args: makeForward({incoming_circuit_key: {chan_id: '1'}}),
    description: 'An inbound channel index is expected',
    error: 'ExpectedInboundChannelHtlcIndexInRpcForwardRequest',
  },
  {
    args: makeForward({incoming_expiry: undefined}),
    description: 'Incoming expiry is expected',
    error: 'ExpectedCltvTimeoutHeightInRpcForwardRequest',
  },
  {
    args: makeForward({outgoing_amount_msat: undefined}),
    description: 'An outgoing amount is expected',
    error: 'ExpectedOutgoingAmountMillitokensInRpcForwardRequest',
  },
  {
    args: makeForward({outgoing_expiry: undefined}),
    description: 'An outgoing expiry height is expected',
    error: 'ExpectedOutgoingExpiryHeightInRpcForwardRequest',
  },
  {
    args: makeForward({outgoing_expiry: 3}),
    description: 'An outgoing expiry height is expected',
    error: 'ExpectedIncomingForwardExpiryHigherThanOutgoingExpiry',
  },
  {
    args: makeForward({outgoing_requested_chan_id: undefined}),
    description: 'An outgoing requested channel id is expected',
    error: 'ExpectedOutgoingRequestedChannelIdInRpcForwardRequest',
  },
  {
    args: makeForward({payment_hash: undefined}),
    description: 'A payment preimage hash is expected',
    error: 'ExpectedPaymentHashBufferInRpcForwardRequest',
  },
  {
    args: makeForward({outgoing_amount_msat: '3'}),
    description: 'Outgoing amount should be equal or less than incoming',
    error: 'UnexpectedNegativeFeeInRpcForwardRequest',
  },
  {
    args: makeForward({}),
    description: 'An RPC forward request is mapped to a request',
    expected: {
      cltv_delta: 1,
      fee: 0,
      fee_mtokens: '1',
      hash: Buffer.alloc(32).toString('hex'),
      in_channel: '0x0x1',
      in_payment: 0,
      messages: [{type: '16', value: '01'}],
      mtokens: '1',
      onion: undefined,
      out_channel: '0x0x2',
      timeout: 2,
      tokens: 0,
    },
  },
  {
    args: makeForward({onion_blob: Buffer.alloc(1)}),
    description: 'An RPC forward request with onion is mapped to a request',
    expected: {
      cltv_delta: 1,
      fee: 0,
      fee_mtokens: '1',
      hash: Buffer.alloc(32).toString('hex'),
      in_channel: '0x0x1',
      in_payment: 0,
      messages: [{type: '16', value: '01'}],
      mtokens: '1',
      onion: '00',
      out_channel: '0x0x2',
      timeout: 2,
      tokens: 0,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcForwardAsForwardRequest(args), new Error(error), 'Err');
    } else {
      const request = rpcForwardAsForwardRequest(args);

      strictSame(request, expected, 'Got expected forward request');
    }

    return end();
  });
});
