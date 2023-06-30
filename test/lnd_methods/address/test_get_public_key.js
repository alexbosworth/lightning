const {equal} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getPublicKey} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'Key family is required',
    error: [400, 'ExpectedKeyFamilyToGetPublicKey'],
  },
  {
    args: {family: 1, index: 1},
    description: 'LND is required',
    error: [400, 'ExpectedWalletRpcLndToGetPublicKey'],
  },
  {
    args: {family: 1, index: 1, lnd: {}},
    description: 'LND is required',
    error: [400, 'ExpectedWalletRpcLndToGetPublicKey'],
  },
  {
    args: {family: 1, index: 1, lnd: {wallet: {}}},
    description: 'LND is required',
    error: [400, 'ExpectedWalletRpcLndToGetPublicKey'],
  },
  {
    args: {
      family: 1,
      index: 1,
      lnd: {wallet: {deriveKey: ({}, cbk) => cbk('err')}},
    },
    description: 'Unexpected errors are passed back',
    error: [503, 'UnexpectedErrGettingPublicKeyFromSeed', {err: 'err'}],
  },
  {
    args: {
      family: 1,
      index: 1,
      lnd: {wallet: {deriveKey: ({}, cbk) => cbk()}},
    },
    description: 'Expects result back',
    error: [503, 'UnexpectedResultInDerivePublicKeyResponse'],
  },
  {
    args: {
      family: 1,
      index: 1,
      lnd: {wallet: {deriveKey: ({}, cbk) => cbk(null, {})}},
    },
    description: 'Expects result back',
    error: [503, 'ExpectedRawPubKeyBytesInDerivePubKeyResponse'],
  },
  {
    args: {
      family: 1,
      index: 1,
      lnd: {wallet: {deriveKey: ({}, cbk) => cbk(null, {
        raw_key_bytes: Buffer.alloc(1),
      })}},
    },
    description: 'Expects result key loc',
    error: [503, 'ExpectedKeyLocatorInPublicKeyResponse'],
  },
  {
    args: {
      family: 1,
      index: 1,
      lnd: {wallet: {deriveKey: ({}, cbk) => cbk(null, {
        key_loc: {},
        raw_key_bytes: Buffer.alloc(1),
      })}},
    },
    description: 'Expects result key loc index',
    error: [503, 'ExpectedKeyIndexInPublicKeyResponse'],
  },
  {
    args: {
      family: 1,
      index: 1,
      lnd: {
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
        },
      },
    },
    description: 'Got public key result',
    expected: {public_key: '00'},
  },
  {
    args: {
      family: 1,
      lnd: {
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
          deriveNextKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
        },
      },
    },
    description: 'Got public key result',
    expected: {public_key: '00'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getPublicKey(args), error, 'Got expected error');
    } else {
      const res = await getPublicKey(args);

      equal(res.public_key, expected.public_key, 'Got expected public key');
    }

    return;
  });
});
