const {test} = require('@alexbosworth/tap');

const {payViaRouteRequest} = require('./../../lnd_messages');

const makeArgs = overrides => {
  const args = {
    payment_hash: Buffer.alloc(32),
    route: {
      hops: [{
        amt_to_forward_msat: '1',
        chan_id: '1',
        chan_capacity: 1,
        custom_records: {},
        expiry: 1,
        pub_key: Buffer.alloc(33, 3).toString('hex'),
        fee_msat: '1',
        tlv_payload: true,
      }],
      total_amt_msat: '1',
      total_fees_msat: '1',
      total_time_lock: 1,
    },
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    id: Buffer.alloc(32).toString('hex'),
    route: {
      fee: 0,
      fee_mtokens: '1',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 0,
        fee_mtokens: '1',
        forward: 0,
        forward_mtokens: '1',
        public_key: Buffer.alloc(33, 3).toString('hex'),
        timeout: 1,
      }],
      mtokens: '1',
      payment: undefined,
      timeout: 1,
      tokens: 0,
      total_mtokens: undefined,
    },
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Pay via route request is converted to pay details',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => payViaRouteRequest(args), new Error(error), 'Got error');
    } else {
      const res = payViaRouteRequest(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
