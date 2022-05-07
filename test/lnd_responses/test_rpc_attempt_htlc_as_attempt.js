const {test} = require('@alexbosworth/tap');

const {rpcAttemptHtlcAsAttempt} = require('./../../lnd_responses');

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

const makeArgs = overrides => {
  const args = {
    route,
    attempt_time_ns: '1',
    resolve_time_ns: '1',
    status: 'IN_FLIGHT',
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const attempt = {
    confirmed_at: '1970-01-01T00:00:00.000Z',
    created_at: '1970-01-01T00:00:00.000Z',
    failed_at: undefined,
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

const tests = [
  {
    args: null,
    description: 'An rpc attempt is required to map to an attempt',
    error: 'ExpectedRpcAttemptDetailsToDeriveAttempt',
  },
  {
    args: makeArgs({attempt_time_ns: undefined}),
    description: 'Expected attempt time in rpc attempt details',
    error: 'ExpectedRpcAttemptStartTimeNs',
  },
  {
    args: makeArgs({resolve_time_ns: undefined}),
    description: 'Expected resolve time in rpc attempt details',
    error: 'ExpectedRpcAttemptResolveTimeNs',
  },
  {
    args: makeArgs({route: undefined}),
    description: 'Expected route in rpc attempt details',
    error: 'ExpectedRouteAttemptedInRpcAttemptDetails',
  },
  {
    args: makeArgs({status: undefined}),
    description: 'A status code is expected',
    error: 'ExpectedAttemptStatusInRpcAttemptDetails',
  },
  {
    args: makeArgs({}),
    description: 'An in flight rpc attempt is mapped to an attempt',
    expected: makeExpected({confirmed_at: undefined, is_pending: true}),
  },
  {
    args: makeArgs({status: 'SUCCEEDED'}),
    description: 'An rpc attempt is mapped to an attempt',
    expected: makeExpected({is_confirmed: true}),
  },
  {
    args: makeArgs({status: 'FAILED'}),
    description: 'An rpc attempt is mapped to an attempt',
    expected: makeExpected({
      confirmed_at: undefined,
      failed_at: '1970-01-01T00:00:00.000Z',
      is_failed: true,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcAttemptHtlcAsAttempt(args), new Error(error), 'Got err');
    } else {
      const attempt = rpcAttemptHtlcAsAttempt(args);

      strictSame(attempt, expected.attempt, 'Got attempt from rpc attempt');
    }

    return end();
  });
});
