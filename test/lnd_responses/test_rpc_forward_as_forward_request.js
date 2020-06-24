const {test} = require('tap');

const {rpcForwardAsForwardRequest} = require('./../../lnd_responses');

const makeForward = override => {
  const forward = {
    amount_msat: '1',
    expiry: 1,
    htlc_payment_hash: Buffer.alloc(32),
    incoming_circuit_key: {
      chan_id: '1',
      htlc_id: '0',
    },
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
    args: makeForward({amount_msat: undefined}),
    description: 'Amount is expected',
    error: 'ExpectedAmountMillitokensInRpcForwardRequest',
  },
  {
    args: makeForward({expiry: undefined}),
    description: 'Expiry is expected',
    error: 'ExpectedCltvTimeoutHeightInRpcForwardRequest',
  },
  {
    args: makeForward({htlc_payment_hash: undefined}),
    description: 'A payment preimage hash is expected',
    error: 'ExpectedPaymentHashBufferInRpcForwardRequest',
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
    args: makeForward({}),
    description: 'An RPC forward request is mapped to a request',
    expected: {
      hash: Buffer.alloc(32).toString('hex'),
      in_channel: '0x0x1',
      in_payment: 0,
      mtokens: '1',
      timeout: 1,
      tokens: 0,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({deepIs, end, equal, throws}) => {
    if (!!error) {
      throws(() => rpcForwardAsForwardRequest(args), new Error(error), 'Err');
    } else {
      const request = rpcForwardAsForwardRequest(args);

      deepIs(request, expected, 'Got expected forward request');
    }

    return end();
  });
});
