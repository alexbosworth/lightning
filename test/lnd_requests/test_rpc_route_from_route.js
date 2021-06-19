const {test} = require('@alexbosworth/tap');

const {rpcRouteFromRoute} = require('./../../lnd_requests');

const tests = [
  {
    args: {},
    description: 'A routing fee is expected',
    error: 'ExpectedFeeNumberToMapRouteToRpcRoute',
  },
  {
    args: {fee: 1},
    description: 'Tokens are expected',
    error: 'ExpectedTokensNumberToMapRouteToRpcRoute',
  },
  {
    args: {
      fee: 1,
      fee_mtokens: '1000',
      hops: [],
      mtokens: '1000',
      timeout: 1,
      tokens: 1,
    },
    description: 'RPC route is returned',
    expected: {
      hops: [],
      total_amt: '1',
      total_amt_msat: '1000',
      total_fees: '1',
      total_fees_msat: '1000',
      total_time_lock: 1,
    },
  },
  {
    args: {
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward: 1,
        forward_mtokens: '1000',
        timeout: 1,
      }],
      messages: [],
      mtokens: '1000',
      payment: Buffer.alloc(32).toString('hex'),
      timeout: 1,
      tokens: 1,
    },
    description: 'RPC route with payment',
    expected: {
      hops: [{
        amt_to_forward: '1',
        amt_to_forward_msat: '1000',
        chan_id: '1',
        chan_capacity: '1',
        expiry: 1,
        fee: '1',
        fee_msat: '1000',
        mpp_record: {
          payment_addr: Buffer.alloc(32),
          total_amt_msat: undefined,
        },
        pub_key: undefined,
        tlv_payload: true,
      }],
      total_amt: '1',
      total_amt_msat: '1000',
      total_fees: '1',
      total_fees_msat: '1000',
      total_time_lock: 1,
    },
  },
  {
    args: {
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward: 1,
        forward_mtokens: '1000',
        timeout: 1,
      }],
      messages: [{type: '1', value: '00'}],
      mtokens: '1000',
      timeout: 1,
      tokens: 1,
      total_mtokens: '1',
    },
    description: 'RPC route with message',
    expected: {
      hops: [{
        amt_to_forward: '1',
        amt_to_forward_msat: '1000',
        chan_id: '1',
        chan_capacity: '1',
        custom_records: {'1': Buffer.alloc(1)},
        expiry: 1,
        fee: '1',
        fee_msat: '1000',
        mpp_record: {payment_addr: undefined, total_amt_msat: '1'},
        pub_key: undefined,
        tlv_payload: true,
      }],
      total_amt: '1',
      total_amt_msat: '1000',
      total_fees: '1',
      total_fees_msat: '1000',
      total_time_lock: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcRouteFromRoute(args), new Error(error), 'Got error');
    } else {
      strictSame(rpcRouteFromRoute(args), expected, 'RPC route is derived');
    }

    return end();
  });
});
