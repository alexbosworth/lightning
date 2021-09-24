const {test} = require('@alexbosworth/tap');

const {rpcChannelAsOldRpcChannel} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const args = {
    channel: {
      commitment_type: undefined,
      uptime: 1,
    },
    version: undefined,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Initiated RPC channel is mapped to channel',
    expected: {commitment_type: undefined, uptime: 1},
  },
  {
    args: makeArgs({
      channel: {commitment_type: undefined, uptime: 1},
      version: '0.11.1-beta',
    }),
    description: 'Old RPC channel is mapped to channel',
    expected: {commitment_type: 'UNKNOWN_COMMITMENT_TYPE', uptime: 1},
  },
  {
    args: makeArgs({
      channel: {commitment_type: 'LEGACY', uptime: 1},
      version: '0.11.1-beta',
    }),
    description: 'Legacy was 0 but it is updated to 1, so 1 means 2',
    expected: {commitment_type: 'STATIC_REMOTE_KEY', uptime: 1},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcChannelAsOldRpcChannel(args), new Error(error), 'Error');
    } else {
      const channel = rpcChannelAsOldRpcChannel(args);

      strictSame(channel, expected, 'Channel cast as old channel');
    }

    return end();
  });
});
