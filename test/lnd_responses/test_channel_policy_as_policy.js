const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const chanPolicyAsPolicy = require('./../../lnd_responses/channel_policy_as_policy');

const makeExpected = overrides => {
  const expected = {
    base_fee_mtokens: '1',
    cltv_delta: 1,
    fee_rate: 1,
    inbound_base_discount_mtokens: '0',
    inbound_rate_discount: 0,
    is_disabled: false,
    max_htlc_mtokens: '1',
    min_htlc_mtokens: '1',
    public_key: '00',
    updated_at: new Date(1000).toISOString(),
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    args: {},
    description: 'A public key is required',
    error: 'ExpectedPublicKeyForChannelPolicy',
  },
  {
    args: {public_key: '00', policy: {}},
    description: 'Enabled status is required',
    error: 'ExpectedChannelPolicyDisabledStatus',
  },
  {
    args: {public_key: '00', policy: {disabled: false}},
    description: 'Base fee is required',
    error: 'ExpectedChannelPolicyBaseFee',
  },
  {
    args: {public_key: '00', policy: {disabled: false, fee_base_msat: '1'}},
    description: 'Fee rate is required',
    error: 'ExpectedChannelPolicyFeeRate',
  },
  {
    args: {
      public_key: '00',
      policy: {disabled: false, fee_base_msat: '1', fee_rate_milli_msat: '1'},
    },
    description: 'Last update is required',
    error: 'ExpectedPolicyLastUpdateInChannelPolicy',
  },
  {
    args: {
      public_key: '00',
      policy: {
        disabled: false,
        fee_base_msat: '1',
        fee_rate_milli_msat: '1',
        last_update: 1,
      },
    },
    description: 'Max HTLC is required',
    error: 'ExpectedChannelPolicyMaximumHtlcValue',
  },
  {
    args: {
      public_key: '00',
      policy: {
        disabled: false,
        fee_base_msat: '1',
        fee_rate_milli_msat: '1',
        last_update: 1,
        max_htlc_msat: '1',
      },
    },
    description: 'Min HTLC is required',
    error: 'ExpectedChannelPolicyMinimumHtlcValue',
  },
  {
    args: {
      public_key: '00',
      policy: {
        disabled: false,
        fee_base_msat: '1',
        fee_rate_milli_msat: '1',
        last_update: 1,
        max_htlc_msat: '1',
        min_htlc: '1',
      },
    },
    description: 'CLTV delta is required',
    error: 'ExpectedChannelNodePolicyTimelockDelta',
  },
  {
    args: {public_key: '00'},
    description: 'Empty policy is mapped',
    expected: {public_key: '00'},
  },
  {
    args: {
      public_key: '00',
      policy: {
        disabled: false,
        fee_base_msat: '1',
        fee_rate_milli_msat: '1',
        last_update: 1,
        max_htlc_msat: '1',
        min_htlc: '1',
        time_lock_delta: 1,
      },
    },
    description: 'Policy mapped',
    expected: makeExpected({}),
  },
  {
    args: {
      public_key: '00',
      policy: {
        disabled: false,
        fee_base_msat: '1',
        fee_rate_milli_msat: '1',
        inbound_fee_base_msat: -1,
        inbound_fee_rate_milli_msat: -1,
        last_update: 1,
        max_htlc_msat: '1',
        min_htlc: '1',
        time_lock_delta: 1,
      },
    },
    description: 'Policy mapped',
    expected: makeExpected({
      inbound_base_discount_mtokens: '1',
      inbound_rate_discount: 1,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => chanPolicyAsPolicy(args), new Error(error), 'Got error');
    } else {
      const policy = chanPolicyAsPolicy(args);

      deepStrictEqual(policy, expected, 'Raw policy cast as policy');
    }

    return end();
  });
});
