const {test} = require('@alexbosworth/tap');

const {rpcWalletStateAsState} = require('./../../lnd_responses');

const makeExpected = overrides => {
  const expected = {};

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    description: 'No response throws an error',
    error: 'ExpectedStateResponse',
  },
  {
    args: {},
    description: 'No state in response throws an error',
    error: 'ExpectedStateInStateResponse',
  },
  {
    args: {state: 'NON_EXISTING'},
    description: 'Wallet does not exist',
    expected: makeExpected({is_absent: true}),
  },
  {
    args: {state: 'RPC_ACTIVE'},
    description: 'Wallet is ready',
    expected: makeExpected({is_active: true}),
  },
  {
    args: {state: 'SERVER_ACTIVE'},
    description: 'Server is ready',
    expected: makeExpected({is_active: true, is_ready: true}),
  },
  {
    args: {state: 'LOCKED'},
    description: 'Wallet file is encrypted',
    expected: makeExpected({is_locked: true}),
  },
  {
    args: {state: 'UNLOCKED'},
    description: 'Wallet file was decrypted and wallet is starting up',
    expected: makeExpected({is_starting: true}),
  },
  {
    args: {state: 'WAITING_TO_START'},
    description: 'Wallet is waiting for leader election to start',
    expected: makeExpected({is_waiting: true}),
  },
  {
    args: {state: 'UNCOVERED'},
    description: 'State received is uncovered by mapping',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcWalletStateAsState(args), new Error(error), 'Got error');
    } else {
      strictSame(rpcWalletStateAsState(args), expected, 'Got expected');
    }

    return end();
  })
});
