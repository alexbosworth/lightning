const {test} = require('@alexbosworth/tap');

const {createWallet} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedLndForWalletCreation'],
  },
  {
    args: {lnd: {unlocker: {initWallet: ({}, cbk) => {}}}},
    description: 'Wallet password is required',
    error: [400, 'ExpectedWalletPasswordForWalletCreation'],
  },
  {
    args: {lnd: {unlocker: {initWallet: ({}, cbk) => {}}}, password: 'pass'},
    description: 'Seed is required',
    error: [400, 'ExpectedSeedMnemonicForWalletCreation'],
  },
  {
    args: {
      lnd: {unlocker: {initWallet: ({}, cbk) => cbk('err')}},
      passphrase: 'passphrase',
      password: 'pass',
      seed: 'seed',
    },
    description: 'Errors are passed back',
    error: [503, 'UnexpectedInitWalletError', {err: 'err'}],
  },
  {
    args: {
      lnd: {
        unlocker: {
          initWallet: ({}, cbk) => cbk(null, {
            admin_macaroon: Buffer.alloc(1),
          }),
        },
      },
      password: 'pass',
      seed: 'seed',
    },
    description: 'Errors are passed back',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(createWallet(args), error, 'Got expected error');
    } else {
      await createWallet(args);
    }

    return end();
  });
});
