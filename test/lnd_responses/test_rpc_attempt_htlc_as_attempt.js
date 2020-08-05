const {test} = require('tap');

const {rpcAttemptHtlcAsAttempt} = require('./../../lnd_responses');

const makeExpected = overrides => {
  const attempt = {
    is_confirmed: false,
    is_failed: false,
    is_pending: false,
    route: {
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward: 1,
        forward_mtokens: '1000',
        public_key: 'a',
        timeout: 1,
      }],
      mtokens: '1000',
      payment: '00',
      timeout: 1,
      tokens: 1,
      total_mtokens: '1',
    },
  };

  Object.keys(overrides).forEach(k => attempt[k] = overrides[k]);

  return {attempt};
};

const route = {
  hops: [{
    amt_to_forward_msat: '1000',
    chan_id: '1',
    chan_capacity: 1,
    expiry: 1,
    fee_msat: '1000',
    mpp_record: {payment_addr: Buffer.alloc(1), total_amt_msat: '1'},
    pub_key: 'a',
    tlv_payload: true,
  }],
  total_amt_msat: '1000',
  total_fees_msat: '1000',
  total_time_lock: 1,
};

const tests = [
  {
    args: null,
    description: 'An rpc attempt is required to map to an attempt',
    error: 'ExpectedRpcAttemptDetailsToDeriveAttempt',
  },
  {
    args: {},
    description: 'Expected route in rpc attempt details',
    error: 'ExpectedRouteAttemptedInRpcAttemptDetails',
  },
  {
    args: {route: {}},
    description: 'A status code is expected',
    error: 'ExpectedAttemptStatusInRpcAttemptDetails',
  },
  {
    args: {route, status: 'IN_FLIGHT'},
    description: 'An in flight rpc attempt is mapped to an attempt',
    expected: makeExpected({is_pending: true}),
  },
  {
    args: {route, status: 'SUCCEEDED'},
    description: 'An rpc attempt is mapped to an attempt',
    expected: makeExpected({is_confirmed: true}),
  },
  {
    args: {route, status: 'FAILED'},
    description: 'An rpc attempt is mapped to an attempt',
    expected: makeExpected({is_failed: true}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({deepIs, end, equal, throws}) => {
    if (!!error) {
      throws(() => rpcAttemptHtlcAsAttempt(args), new Error(error), 'Got err');
    } else {
      const attempt = rpcAttemptHtlcAsAttempt(args);

      deepIs(attempt, expected.attempt, 'Got attempt from rpc attempt');
    }

    return end();
  });
});
