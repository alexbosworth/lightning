const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

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
  {
    args: {
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        encrypted_data: '01',
        fee: 0,
        fee_mtokens: '0',
        forward: 1,
        forward_mtokens: '1000',
        path_key: '02',
        public_key: 'public_key',
        timeout: 1,
      }],
      mtokens: '2000',
      payment: Buffer.alloc(32).toString('hex'),
      timeout: 1,
      tokens: 2,
    },
    description: 'A blinded path route cannot have a payment identifier',
    error: 'ExpectedNoPaymentIdentifierForBlindedPathRoute',
  },
  {
    args: {
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        encrypted_data: '01',
        fee: 0,
        fee_mtokens: '0',
        forward: 1,
        forward_mtokens: '1000',
        path_key: '02',
        public_key: 'public_key',
        timeout: 1,
      }],
      messages: [{type: '1', value: '00'}],
      mtokens: '2000',
      timeout: 1,
      tokens: 2,
    },
    description: 'A blinded path route cannot have messages',
    error: 'ExpectedNoMessagesForBlindedPathRoute',
  },
  {
    args: {
      fee: 1,
      fee_mtokens: '1000',
      hops: [
        {
          channel: '0x0x1',
          encrypted_data: '01',
          fee: 1,
          fee_mtokens: '1000',
          forward: 0,
          forward_mtokens: '0',
          path_key: '02',
          public_key: 'introduction_node',
          timeout: 0,
        },
        {
          channel: '0x0x0',
          encrypted_data: '03',
          fee: 0,
          fee_mtokens: '0',
          forward: 1,
          forward_mtokens: '1000',
          public_key: 'blinded_node',
          timeout: 1,
        },
      ],
      messages: [],
      mtokens: '2000',
      timeout: 1,
      tokens: 2,
    },
    description: 'RPC route into a blinded path',
    expected: {
      hops: [
        {
          amt_to_forward: '0',
          amt_to_forward_msat: '0',
          blinding_point: Buffer.from('02', 'hex'),
          chan_id: '1',
          encrypted_data: Buffer.from('01', 'hex'),
          expiry: 0,
          fee: '1',
          fee_msat: '1000',
          pub_key: 'introduction_node',
          tlv_payload: true,
        },
        {
          amt_to_forward: '1',
          amt_to_forward_msat: '1000',
          chan_id: '0',
          encrypted_data: Buffer.from('03', 'hex'),
          expiry: 1,
          fee: '0',
          fee_msat: '0',
          pub_key: 'blinded_node',
          tlv_payload: true,
          total_amt_msat: '1000',
        },
      ],
      total_amt: '2',
      total_amt_msat: '2000',
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
        encrypted_data: '01',
        fee: 0,
        fee_mtokens: '0',
        forward: 1,
        forward_mtokens: '1000',
        path_key: '02',
        public_key: 'introduction_node',
        timeout: 1,
      }],
      mtokens: '2000',
      timeout: 1,
      tokens: 2,
      total_mtokens: '3000',
    },
    description: 'RPC route into a blinded path with a total amount',
    expected: {
      hops: [{
        amt_to_forward: '1',
        amt_to_forward_msat: '1000',
        blinding_point: Buffer.from('02', 'hex'),
        chan_id: '1',
        encrypted_data: Buffer.from('01', 'hex'),
        expiry: 1,
        fee: '0',
        fee_msat: '0',
        pub_key: 'introduction_node',
        tlv_payload: true,
        total_amt_msat: '3000',
      }],
      total_amt: '2',
      total_amt_msat: '2000',
      total_fees: '1',
      total_fees_msat: '1000',
      total_time_lock: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => rpcRouteFromRoute(args), new Error(error), 'Got error');
    } else {
      deepStrictEqual(rpcRouteFromRoute(args), expected, 'RPC route derived');
    }

    return end();
  });
});
