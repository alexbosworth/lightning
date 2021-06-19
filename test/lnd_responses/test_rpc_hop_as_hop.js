const {test} = require('@alexbosworth/tap');

const {rpcHopAsHop} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    amt_to_forward_msat: '1000',
    chan_id: '1',
    chan_capacity: 1,
    expiry: 1,
    fee_msat: '1000',
    mpp_record: {payment_addr: Buffer.alloc(1), total_amt_msat: '1'},
    pub_key: 'a',
    tlv_payload: true,
  };

  Object.keys(overrides || {}).forEach(key => args[key] = overrides[key]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    channel: '0x0x1',
    channel_capacity: 1,
    fee: 1,
    fee_mtokens: '1000',
    forward: 1,
    forward_mtokens: '1000',
    public_key: 'a',
    timeout: 1,
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    args: null,
    description: 'A rpc hop is required to map to a hop',
    error: 'ExpectedRpcHopToDeriveHop',
  },
  {
    args: makeArgs({amt_to_forward_msat: null}),
    description: 'Amount to forward msat is expected',
    error: 'ExpectedAmountToForwardMillisatoshisInRpcHopDetails',
  },
  {
    args: makeArgs({chan_id: null}),
    description: 'Channel id is expected',
    error: 'ExpectedNumericChannelIdInRpcHopDetails',
  },
  {
    args: makeArgs({chan_capacity: undefined}),
    description: 'Channel capacity is expected',
    error: 'ExpectedChannelCapacityTokensNumberInRpcHopDetails',
  },
  {
    args: makeArgs({fee_msat: undefined}),
    description: 'Forwarding fee millitokens is expected',
    error: 'ExpectedHtlcForwardingMillitokensFeeInRpcHopDetails',
  },
  {
    args: makeArgs({fee_msat: undefined}),
    description: 'Forwarding fee millitokens is expected',
    error: 'ExpectedHtlcForwardingMillitokensFeeInRpcHopDetails',
  },
  {
    args: makeArgs({mpp_record: {total_amt_msat: '1'}}),
    description: 'Payment address is expected',
    error: 'ExpectedMultipathPaymentAddressInRecord',
  },
  {
    args: makeArgs({mpp_record: {payment_addr: Buffer.alloc(1)}}),
    description: 'Total amount millitokens is expected',
    error: 'ExpectedMultipathRecordTotalPaymentAmountMillitokens',
  },
  {
    args: makeArgs({pub_key: undefined}),
    description: 'A public key is expected',
    error: 'ExpectedForwardToPublicKeyInRpcHopDetails',
  },
  {
    args: makeArgs({tlv_payload: undefined}),
    description: 'A public key is expected',
    error: 'ExpectedTlvPayloadPresenceInRpcHopDetails',
  },
  {
    args: makeArgs({}),
    description: 'A hop is mapped',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({expiry: undefined}),
    description: 'A hop is mapped that has no expiry set',
    expected: makeExpected({timeout: undefined}),
  },
  {
    args: makeArgs({tlv_payload: false}),
    description: 'A hop is mapped when there is no tlv payload',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcHopAsHop(args), new Error(error), 'Got err');
    } else {
      strictSame(rpcHopAsHop(args), expected, 'Got expected result');
    }

    return end();
  });
});
