const {test} = require('@alexbosworth/tap');

const {rpcPaymentAsPayment} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    creation_date: '1',
    creation_time_ns: '0',
    failure_reason: 'FAILURE_REASON_TIMEOUT',
    fee_msat: '1000',
    fee_sat: '1',
    htlcs: [{
      attempt_time_ns: '1000000',
      failure: {
        channel_update: {
          base_fee: '1000',
          chain_hash: Buffer.alloc(32),
          chan_id: '1',
          channel_flags: 1,
          extra_opaque_data: Buffer.alloc(1),
          fee_rate: 1,
          htlc_maximum_msat: '1000',
          htlc_minimum_msat: '1000',
          message_flags: 1,
          signature: Buffer.alloc(71),
          time_lock_delta: 1,
          timestamp: 1,
        },
        code: 'UNREADABLE_FAILURE',
        failure_source_index1: 1,
        height: 1,
        htlc_msat: '1000',
      },
      resolve_time_ns: '1000000',
      route: {
        hops: [
          {
            amt_to_forward_msat: '1000',
            chan_id: '1',
            chan_capacity: 1,
            expiry: 1,
            fee_msat: '1000',
            mpp_record: {
              payment_addr: Buffer.alloc(32),
              total_amt_msat: '1000',
            },
            pub_key: Buffer.alloc(33).toString('hex'),
            tlv_payload: true,
          },
          {
            amt_to_forward_msat: '1000',
            chan_id: '1',
            chan_capacity: 1,
            expiry: 1,
            fee_msat: '1000',
            mpp_record: {
              payment_addr: Buffer.alloc(32),
              total_amt_msat: '1000',
            },
            pub_key: Buffer.alloc(33).toString('hex'),
            tlv_payload: true,
          },
        ],
        total_amt: '1',
        total_amt_msat: '1000',
        total_fees: '1',
        total_fees_msat: '1000',
        total_time_lock: 1,
      },
      status: 'FAILED',
    }],
    payment_hash: Buffer.alloc(32).toString('hex'),
    payment_index: '1',
    payment_preimage: Buffer.alloc(32, 1).toString('hex'),
    payment_request: 'lntb1500n1pdn4czkpp5ugdqer05qrrxuchrzkcue94th9w2xzasp9qm7d0yxcgp4uh4kn4qdpa2fjkzep6yprkcmmzv9kzqsmj09c8gmmrw4e8yetwvdujq5n9va6kcct5d9hkucqzysdlghdpua7uvjjkcfj49psxtlqzkp5pdncffdfk2cp3mp76thrl29qhqgzufm503pjj96586n5w6edgw3n66j4rxxs707y4zdjuhyt6qqe5weu4',
    status: 'SETTLED',
    value: '1',
    value_msat: '1000',
    value_sat: '1',
  };

  Object.keys(overrides || {}).forEach(key => args[key] = overrides[key]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    attempts: [{
      confirmed_at: undefined,
      created_at: '1970-01-01T00:00:00.001Z',
      failed_at: '1970-01-01T00:00:00.001Z',
      is_confirmed: false,
      is_failed: true,
      is_pending: false,
      route: {
        fee: 1,
        fee_mtokens: '1000',
        hops: [
          {
            channel: '0x0x1',
            channel_capacity: 1,
            fee: 1,
            fee_mtokens: '1000',
            forward: 1,
            forward_mtokens: '1000',
            public_key: Buffer.alloc(33).toString('hex'),
            timeout: 1,
          },
          {
            channel: '0x0x1',
            channel_capacity: 1,
            fee: 1,
            fee_mtokens: '1000',
            forward: 1,
            forward_mtokens: '1000',
            public_key: Buffer.alloc(33).toString('hex'),
            timeout: 1,
          },
        ],
        mtokens: '1000',
        payment: Buffer.alloc(32).toString('hex'),
        timeout: 1,
        tokens: 1,
        total_mtokens: '1000',
      },
    }],
    confirmed_at: undefined,
    created_at: '1970-01-01T00:00:01.000Z',
    destination: Buffer.alloc(33).toString('hex'),
    fee: 1,
    fee_mtokens: '1000',
    hops: [Buffer.alloc(33).toString('hex')],
    id: Buffer.alloc(32).toString('hex'),
    index: 1,
    is_confirmed: true,
    is_outgoing: true,
    mtokens: '1000',
    request: 'lntb1500n1pdn4czkpp5ugdqer05qrrxuchrzkcue94th9w2xzasp9qm7d0yxcgp4uh4kn4qdpa2fjkzep6yprkcmmzv9kzqsmj09c8gmmrw4e8yetwvdujq5n9va6kcct5d9hkucqzysdlghdpua7uvjjkcfj49psxtlqzkp5pdncffdfk2cp3mp76thrl29qhqgzufm503pjj96586n5w6edgw3n66j4rxxs707y4zdjuhyt6qqe5weu4',
    safe_fee: 1,
    safe_tokens: 1,
    secret: Buffer.alloc(32, 1).toString('hex'),
    tokens: 1,
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    args: undefined,
    description: 'Payment details are expected',
    error: 'ExpectedPaymentInRpcResponse',
  },
  {
    args: makeArgs({creation_date: undefined}),
    description: 'The creation date is expected',
    error: 'ExpectedCreationDateInRpcPaymentDetails',
  },
  {
    args: makeArgs({fee_sat: 1}),
    description: 'The fee is expected to be a string',
    error: 'ExpectedPaymentFeeInRpcPaymentDetails',
  },
  {
    args: makeArgs({htlcs: undefined}),
    description: 'HTLC array is expected to be present',
    error: 'ExpectedHtlcsArrayInRpcPaymentDetails',
  },
  {
    args: makeArgs({payment_hash: undefined}),
    description: 'A payment hash is expected',
    error: 'ExpectedPaymentHashInRpcPaymentDetails',
  },
  {
    args: makeArgs({payment_preimage: undefined}),
    description: 'A payment preimage is expected',
    error: 'ExpectedPaymentPreimageInRpcPaymentDetails',
  },
  {
    args: makeArgs({value_sat: undefined}),
    description: 'A payment value is expected',
    error: 'ExpectedPaymentValueInRpcPaymentDetails',
  },
  {
    args: makeArgs({}),
    description: 'RPC Payment is mapped to payment details',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({creation_time_ns: '1000000'}),
    description: 'RPC Payment with date is mapped to payment details',
    expected: makeExpected({created_at: '1970-01-01T00:00:00.001Z'}),
  },
  {
    args: makeArgs({payment_request: undefined}),
    description: 'A payment request is optional',
    expected: makeExpected({request: undefined}),
  },
  {
    args: makeArgs({htlcs: []}),
    description: 'Attempts are optional',
    expected: makeExpected({
      attempts: [],
      destination: '02212d3ec887188b284dbb7b2e6eb40629a6e14fb049673f22d2a0aa05f902090e',
      fee: undefined,
      fee_mtokens: undefined,
      hops: [],
      is_confirmed: false,
      safe_fee: undefined,
      secret: undefined,
    }),
  },
  {
    args: makeArgs({htlcs: [], payment_request: ''}),
    description: 'Payment requests are optional when there are no attempts',
    expected: makeExpected({
      attempts: [],
      destination: undefined,
      fee: undefined,
      fee_mtokens: undefined,
      hops: [],
      is_confirmed: false,
      request: undefined,
      safe_fee: undefined,
      secret: undefined,
    }),
  },
  {
    args: makeArgs({payment_preimage: Buffer.alloc(32).toString('hex')}),
    description: 'Empty preimage means not settled',
    expected: makeExpected({
      fee: undefined,
      fee_mtokens: undefined,
      is_confirmed: false,
      safe_fee: undefined,
      secret: undefined,
    }),
  },
  {
    args: makeArgs({
      creation_date: '1587410235',
      creation_time_ns: '1587410235356761000',
      failure_reason: 'FAILURE_REASON_NONE',
      fee: '0',
      fee_msat: '0',
      fee_sat: '0',
      path: [],
      htlcs: [{
        attempt_time_ns: '1587410235428357000',
        failure: null,
        route: {
          hops: [{
            amt_to_forward: '100',
            amt_to_forward_msat: '100000',
            chan_capacity: '1000000',
            chan_id: '487083651170304',
            custom_records: {},
            expiry: 491,
            fee: '0',
            fee_msat: '0',
            pub_key: '029860f8550e29316ee97460c79228d939b18d2a51dbef407f410e265c79b19073',
            tlv_payload: true,
            mpp_record: {
              payment_addr: Buffer.alloc(32),
              total_amt_msat: '100000',
            },
          }],
          total_amt: '100',
          total_amt_msat: '100000',
          total_fees: '0',
          total_fees_msat: '0',
          total_time_lock: 491,
        },
        resolve_time_ns: '1587410236160796000',
        status: 'SUCCEEDED',
      }],
      payment_hash: '0afa2dcb99be0716da8e3340d2f0c2ae4f4f39e670a9728e79d94ee31f4dbd9e',
      payment_index: '0',
      payment_preimage: 'd7ea807df3d6157c23e0143bc2afd9831e61f174f3c1a8f15cad2426d927ce9c',
      payment_request: 'lnbcrt1u1p0fmafmpp5ptazmjuehcr3dk5wxdqd9uxz4e857w0xwz5h9rnem98wx86dhk0qdqqcqzpgxq92fjuqsp5ulvng3vsa6spedynlxeaufjy76njua2ykvhdnjztshcg92lfd2kq9qy9qsqsf9ct3nsfmfjz9fz9jkh376txuse520jjyg9vmm4tchnd9rh7umzwwxz7em5wmfx0y2eudcjj98kmgryz9r9evrcp7e4c9rwkemnswsqgptmd9',
      status: 'SUCCEEDED',
      value: '100',
      value_msat: '100000',
      value_sat: '100',
    }),
    description: 'A realistic successful payment is mapped to a payment',
    expected: makeExpected({
      attempts: [{
        confirmed_at: '2020-04-20T19:17:16.160Z',
        created_at: '2020-04-20T19:17:15.428Z',
        failed_at: undefined,
        is_confirmed: true,
        is_failed: false,
        is_pending: false,
        route: {
          fee: 0,
          fee_mtokens: '0',
          hops: [{
            channel: '443x1x0',
            channel_capacity: 1000000,
            fee: 0,
            fee_mtokens: '0',
            forward: 100,
            forward_mtokens: '100000',
            public_key: '029860f8550e29316ee97460c79228d939b18d2a51dbef407f410e265c79b19073',
            timeout: 491,
          }],
          mtokens: '100000',
          payment: Buffer.alloc(32).toString('hex'),
          timeout: 491,
          tokens: 100,
          total_mtokens: '100000',
        },
      }],
      confirmed_at: '2020-04-20T19:17:16.160Z',
      created_at: '2020-04-20T19:17:15.356Z',
      destination: '029860f8550e29316ee97460c79228d939b18d2a51dbef407f410e265c79b19073',
      fee: 0,
      fee_mtokens: '0',
      hops: [],
      id: '0afa2dcb99be0716da8e3340d2f0c2ae4f4f39e670a9728e79d94ee31f4dbd9e',
      index: undefined,
      is_confirmed: true,
      is_outgoing: true,
      mtokens: '100000',
      request: 'lnbcrt1u1p0fmafmpp5ptazmjuehcr3dk5wxdqd9uxz4e857w0xwz5h9rnem98wx86dhk0qdqqcqzpgxq92fjuqsp5ulvng3vsa6spedynlxeaufjy76njua2ykvhdnjztshcg92lfd2kq9qy9qsqsf9ct3nsfmfjz9fz9jkh376txuse520jjyg9vmm4tchnd9rh7umzwwxz7em5wmfx0y2eudcjj98kmgryz9r9evrcp7e4c9rwkemnswsqgptmd9',
      safe_fee: 0,
      safe_tokens: 100,
      secret: 'd7ea807df3d6157c23e0143bc2afd9831e61f174f3c1a8f15cad2426d927ce9c',
      tokens: 100,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcPaymentAsPayment(args), new Error(error), 'Got err');
    } else {
      strictSame(rpcPaymentAsPayment(args), expected, 'Got expected result');
    }

    return end();
  });
});
