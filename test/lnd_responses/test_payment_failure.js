const {test} = require('@alexbosworth/tap');

const {paymentFailure} = require('./../../lnd_responses');

const makeFailure = ({fail, overrides}) => {
  const failure = {
    channel: '1',
    failure: {
      channel_update: {
        base_fee: 1,
        chain_hash: Buffer.alloc(32),
        chan_id: '1',
        channel_flags: 1,
        extra_opaque_data: Buffer.alloc(Number()),
        fee_rate: 1,
        htlc_maximum_msat: 1,
        htlc_minimum_msat: 1,
        message_flags: 1,
        signature: Buffer.alloc(72),
        time_lock_delta: 1,
        timestamp: 1,
      },
      code: 'CODE',
      failure_source_index: 1,
      height: 1,
      htlc_msat: '1',
    },
    index: 1,
    key: Buffer.alloc(33).toString('hex'),
    keys: [Buffer.alloc(33).toString('hex')],
  };

  Object.keys(overrides || {}).forEach(k => failure[k] = overrides[k]);

  Object.keys(fail || {}).forEach(k => failure.failure[k] = fail[k]);

  return failure;
};

const makeExpected = overrides => {
  const expected = {
    code: 500,
    details: {
      channel: '1',
      height: 1,
      index: 1,
      mtokens: '1',
      policy: {
        base_fee_mtokens: '1',
        cltv_delta: 1,
        fee_rate: 1,
        is_disabled: undefined,
        max_htlc_mtokens: 1,
        min_htlc_mtokens: 1,
        public_key: '000000000000000000000000000000000000000000000000000000000000000000',
        updated_at: '1970-01-01T00:00:01.000Z'
      },
      timeout_height: undefined,
      update: {
        chain: '0000000000000000000000000000000000000000000000000000000000000000',
        channel_flags: 1,
        extra_opaque_data: '',
        message_flags: 1,
        signature: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      },
    },
    message: 'UnexpectedPayViaRoutesFailure',
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    args: makeFailure({}),
    description: 'Payment is mapped to a payment failure',
    expected: makeExpected({}),
  },
  {
    args: makeFailure({overrides: {failure: undefined}}),
    description: 'Payment is mapped to a payment failure',
    expected: {code: 500, message: 'ExpectedFailureToDerivePaymentFailure'},
  },
  {
    args: makeFailure({fail: {channel_update: {}}}),
    description: 'Failed channel update parse is mapped to a payment failure',
    expected: {code: 500, message: 'ExpectedValidChannelUpdateToDeriveFailure'},
  },
  {
    args: makeFailure({fail: {code: 'AMOUNT_BELOW_MINIMUM'}}),
    description: 'Amount below minimum failure is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'AmountBelowMinimum'}),
  },
  {
    args: makeFailure({fail: {code: 'CHANNEL_DISABLED'}}),
    description: 'Channel disabled is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'ChannelDisabled'}),
  },
  {
    args: makeFailure({fail: {code: 'EXPIRY_TOO_FAR'}}),
    description: 'Expiry too far is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'ExpiryTooFar'}),
  },
  {
    args: makeFailure({fail: {code: 'EXPIRY_TOO_SOON'}}),
    description: 'Expiry too soon is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'ExpiryTooSoon'}),
  },
  {
    args: makeFailure({fail: {code: 'FEE_INSUFFICIENT'}}),
    description: 'Insufficient fee is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'FeeInsufficient'}),
  },
  {
    args: makeFailure({fail: {code: 'FINAL_EXPIRY_TOO_SOON'}}),
    description: 'Final expiry too soon is mapped to a payment failure',
    expected: makeExpected({code: 404, message: 'FinalExpiryTooSoon'}),
  },
  {
    args: makeFailure({fail: {code: 'FINAL_INCORRECT_CLTV_EXPIRY'}}),
    description: 'Final incorrect CLTV is mapped to a payment failure',
    expected: makeExpected({code: 404, message: 'FinalIncorrectCltvExpiry'}),
  },
  {
    args: makeFailure({fail: {code: 'FINAL_INCORRECT_HTLC_AMOUNT'}}),
    description: 'Final incorrect amount is mapped to a payment failure',
    expected: makeExpected({code: 404, message: 'FinalIncorrectHtlcAmount'}),
  },
  {
    args: makeFailure({
      fail: {
        channel: '0x0x1',
        chan_update: null,
        code: 'INCORRECT_CLTV_EXPIRY',
        height: 1,
      },
    }),
    description: 'Incorrect CLTV expiry is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'IncorrectCltvExpiry'}),
  },
  {
    args: makeFailure({fail: {code: 'INCORRECT_OR_UNKNOWN_PAYMENT_DETAILS'}}),
    description: 'Unknown payment details are mapped to a payment failure',
    expected: makeExpected({code: 404, message: 'UnknownPaymentHash'}),
  },
  {
    args: makeFailure({
      fail: {
        channel_update: null,
        code: 'UNKNOWN_PAYMENT_HASH',
        htlc_msat: '0',
      },
    }),
    description: 'Unknown payment hash is mapped to a payment failure',
    expected: makeExpected({
      code: 404,
      details: {
        channel: '1',
        height: 1,
        index: 1,
        mtokens: undefined,
        policy: null,
        timeout_height: undefined,
        update: undefined,
      },
      message: 'UnknownPaymentHash',
    }),
  },
  {
    args: makeFailure({fail: {code: 'INCORRECT_PAYMENT_AMOUNT'}}),
    description: 'Unknown payment amount is mapped to a payment failure',
    expected: makeExpected({code: 404, message: 'IncorrectPaymentAmount'}),
  },
  {
    args: makeFailure({fail: {code: 'INVALID_ONION_HMAC'}}),
    description: 'Invalid onion hmac is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'InvalidOnionHmac'}),
  },
  {
    args: makeFailure({fail: {code: 'INVALID_ONION_KEY'}}),
    description: 'Invalid onion key is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'InvalidOnionKey'}),
  },
  {
    args: makeFailure({fail: {code: 'INVALID_ONION_PAYLOAD'}}),
    description: 'Invalid payload key is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'InvalidOnionPayload'}),
  },
  {
    args: makeFailure({fail: {code: 'INVALID_ONION_VERSION'}}),
    description: 'Invalid onion version is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'InvalidOnionVersion'}),
  },
  {
    args: makeFailure({fail: {code: 'INVALID_REALM'}}),
    description: 'Invalid realm is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'InvalidRealm'}),
  },
  {
    args: makeFailure({fail: {code: 'MPP_TIMEOUT'}}),
    description: 'MPP timeout is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'MppTimeout'}),
  },
  {
    args: makeFailure({fail: {code: 'PERMANENT_CHANNEL_FAILURE'}}),
    description: 'Permanent channel failure is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'PermanentChannelFailure'}),
  },
  {
    args: makeFailure({fail: {code: 'PERMANENT_NODE_FAILURE'}}),
    description: 'Permanent node failure is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'PermanentNodeFailure'}),
  },
  {
    args: makeFailure({fail: {code: 'REQUIRED_CHANNEL_FEATURE_MISSING'}}),
    description: 'Required channel feature is mapped to a payment failure',
    expected: makeExpected({
      code: 503,
      message: 'RequiredChannelFeatureMissing',
    }),
  },
  {
    args: makeFailure({fail: {code: 'REQUIRED_NODE_FEATURE_MISSING'}}),
    description: 'Required node feature is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'RequiredNodeFeatureMissing'}),
  },
  {
    args: makeFailure({fail: {code: 'TEMPORARY_CHANNEL_FAILURE'}}),
    description: 'Temporary channel failure is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'TemporaryChannelFailure'}),
  },
  {
    args: makeFailure({fail: {code: 'TEMPORARY_NODE_FAILURE'}}),
    description: 'Temporary node failure is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'TemporaryNodeFailure'}),
  },
  {
    args: makeFailure({fail: {code: 'UNKNOWN_NEXT_PEER'}}),
    description: 'Unknown next peer is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'UnknownNextPeer'}),
  },
  {
    args: makeFailure({fail: {code: 'UNKNOWN_FAILURE'}}),
    description: 'Unknown failure is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'UnknownFailure'}),
  },
  {
    args: makeFailure({fail: {code: 'UNREADABLE_FAILURE'}}),
    description: 'Unreadable failure is mapped to a payment failure',
    expected: makeExpected({code: 503, message: 'UnreadableFailure'}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => paymentFailure(args), new Error(error), 'Got error');
    } else {
      strictSame(paymentFailure(args), expected, 'Payment failure mapped');
    }

    return end();
  });
});
