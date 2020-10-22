const {test} = require('tap');

const {getInfoResponse} = require('./../fixtures');
const {getIdentity} = require('./../../../lnd_methods');

const makeLnd = ({err, res}) => {
  return {
    default: {
      getInfo: ({}, cbk) => cbk(err, getInfoResponse),
    },
    wallet: {
      deriveKey: ({}, cbk) => cbk('err'),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required to get identity',
    error: [400, 'ExpectedAuthenticatedLndToGetIdentityKey'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Identity is returned',
    expected: {
      public_key: '020000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  {
    args: {
      lnd: {
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {raw_key_bytes: Buffer.alloc(33)}),
        },
      },
    },
    description: 'Identity is returned via wallet rpc',
    expected: {
      public_key: '000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepIs, end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => getIdentity(args), error, 'Got error');
    } else {
      deepIs(await getIdentity(args), expected, 'Got identity');
    }

    return end();
  });
});
