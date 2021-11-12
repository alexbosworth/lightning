const {test} = require('@alexbosworth/tap');

const {routingFailureFromHtlc} = require('./../../lnd_responses');

const makeHtlc = overrides => {
  const htlc = {
    attempt_time_ns: '1',
    failure: {
      channel_update: {
        base_fee: 1,
        chain_hash: Buffer.alloc(32),
        chan_id: '1',
        channel_flags: 1,
        extra_opaque_data: Buffer.alloc(0),
        fee_rate: 1,
        htlc_maximum_msat: 1,
        htlc_minimum_msat: 1,
        message_flags: 1,
        signature: Buffer.alloc(0),
        time_lock_delta: 1,
        timestamp: 1,
      },
      code: 'TEMPORARY_CHANNEL_FAILURE',
      failure_source_index: 0,
      height: 1,
      htlc_msat: '1000',
    },
    resolve_time_ns: '1',
    route: {
      hops: [{
        amt_to_forward: '1',
        amt_to_forward_msat: '1000',
        chan_id: '1',
        chan_capacity: 1,
        expiry: 1,
        fee: 0,
        fee_msat: '0',
        pub_key: Buffer.alloc(33, 3).toString('hex'),
        tlv_payload: true,
      }],
      total_amt: '1',
      total_amt_msat: '1000',
      total_fees: 0,
      total_fees_msat: '0',
      total_time_lock: 1,
    },
    status: 'FAILED',
  };

  Object.keys(overrides || {}).forEach(k => htlc[k] = overrides[k]);

  return htlc;
};

const makeExpected = overrides => {
  const expected = {
    route: {
      fee: 0,
      fee_mtokens: '0',
      hops: [
        {
          channel: '0x0x1',
          channel_capacity: 1,
          fee: 0,
          fee_mtokens: '0',
          forward: 1,
          forward_mtokens: '1000',
          public_key: '030303030303030303030303030303030303030303030303030303030303030303',
          timeout: 1,
        }
      ],
      mtokens: '1000',
      payment: undefined,
      timeout: 1,
      tokens: 1,
      total_mtokens: undefined,
    },
    channel: '0x0x1',
    index: 0,
    mtokens: '1000',
    public_key: undefined,
    reason: 'TemporaryChannelFailure',
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    args: makeHtlc({}),
    description: 'HTLC is mapped to a routing failure',
    expected: makeExpected({}),
  },
  {
    args: makeHtlc({
      failure: {
        channel_update: {
          base_fee: 1,
          chain_hash: Buffer.alloc(32),
          chan_id: '1',
          channel_flags: 1,
          extra_opaque_data: Buffer.alloc(0),
          fee_rate: 1,
          htlc_maximum_msat: 1,
          htlc_minimum_msat: 1,
          message_flags: 1,
          signature: Buffer.alloc(0),
          time_lock_delta: 1,
          timestamp: 1,
        },
        code: 'TEMPORARY_CHANNEL_FAILURE',
        failure_source_index: 1,
        height: 1,
        htlc_msat: '1000',
      },
    }),
    description: 'HTLC is mapped to a routing failure with key',
    expected: makeExpected({
      index: 1,
      public_key: Buffer.alloc(33, 3).toString('hex'),
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => routingFailureFromHtlc(args), new Error(error), 'Got err');
    } else {
      strictSame(routingFailureFromHtlc(args), expected, 'HTLC mapped');
    }

    return end();
  });
});
