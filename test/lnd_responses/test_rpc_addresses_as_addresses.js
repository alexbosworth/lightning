const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {rpcAddressesAsAddresses} = require('./../../lnd_responses');

const makeAddress = overrides => {
  const args = {address: 'address', balance: '0', is_internal: false};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeArgs = overrides => {
  const args = {accounts: [{addresses: [makeAddress({})]}]};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    addresses: [{address: 'address', is_change: false, tokens: 0}],
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: makeArgs({accounts: undefined}),
    description: 'Accounts with addresses are expected',
    error: 'ExpectedArrayOfAccountsWithAddresses',
  },
  {
    args: makeArgs({accounts: [{addresses: undefined}]}),
    description: 'Accounts with addresses are expected',
    error: 'ExpectedArrayOfAddressesInAccountWithAddresses',
  },
  {
    args: makeArgs({
      accounts: [{addresses: [makeAddress({address: undefined})]}],
    }),
    description: 'Accounts with address are expected',
    error: 'ExpectedChainAddressInAccountAddress',
  },
  {
    args: makeArgs({
      accounts: [{addresses: [makeAddress({balance: undefined})]}],
    }),
    description: 'Accounts with balances are expected',
    error: 'ExpectedBalanceTotalForAccountAddress',
  },
  {
    args: makeArgs({
      accounts: [{addresses: [makeAddress({is_internal: undefined})]}],
    }),
    description: 'Accounts with internal markers are expected',
    error: 'ExpectedInternalAddressMarkerInAccountAddress',
  },
  {
    args: makeArgs({}),
    description: 'RPC addresses are mapped to addresses',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => rpcAddressesAsAddresses(args), new Error(error), 'Got err');
    } else {
      const res = rpcAddressesAsAddresses(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return end();
  });
});
