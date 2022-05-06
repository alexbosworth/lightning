const {test} = require('@alexbosworth/tap');

const {diffieHellmanComputeSecret} = require('./../../../');

const makeLnd = (err, res) => {
  return {signer: {deriveSharedKey: ({}, cbk) => cbk(err, res)}};
};

const makeArgs = ({override}) => {
  const args = {
    lnd: makeLnd(null, {shared_key: Buffer.alloc(32)}),
    partner_public_key: '00',
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({override: {lnd: undefined}}),
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToComputeSharedSecret'],
  },
  {
    args: makeArgs({override: {partner_public_key: undefined}}),
    description: 'A public key is required',
    error: [400, 'ExpectedHexEncodedPartnerPublicKey'],
  },
  {
    args: makeArgs({
      override: {
        lnd: {
          signer: {
            deriveSharedKey: ({}, cbk) => cbk({
              details: 'unknown service signrpc.Signer',
            }),
          },
        },
      },
    }),
    description: 'Compute secret is not implemented',
    error: [400, 'ExpectedLndWithSupportForDeriveSharedKey'],
  },
  {
    args: makeArgs({
      override: {lnd: {signer: {deriveSharedKey: ({}, cbk) => cbk('err')}}},
    }),
    description: 'Errors are passed back',
    error: [503, 'UnexpetedErrorDerivingSharedKey', {err: 'err'}],
  },
  {
    args: makeArgs({
      override: {lnd: {signer: {deriveSharedKey: ({}, cbk) => cbk()}}},
    }),
    description: 'A result is expected',
    error: [503, 'ExpectedResultOfDeriveSharedKeyRequest'],
  },
  {
    args: makeArgs({
      override: {lnd: {signer: {deriveSharedKey: ({}, cbk) => cbk(null, {})}}},
    }),
    description: 'A shared key is expected',
    error: [503, 'ExpectedSharedKeyBufferInDeriveKeyResponse'],
  },
  {
    args: makeArgs({
      override: {lnd: {signer: {deriveSharedKey: ({}, cbk) => cbk(null, {
        shared_key: Buffer.alloc(0)},
      )}}},
    }),
    description: 'A shared key with length is expected',
    error: [503, 'UnexpectedSharedKeyLengthInDeriveKeyResponse'],
  },
  {
    args: makeArgs({}),
    description: 'Secret is calculated',
    expected: {
      secret: '0000000000000000000000000000000000000000000000000000000000000000',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(diffieHellmanComputeSecret(args), error, 'Got error');
    } else {
      const {secret} = await diffieHellmanComputeSecret(args);

      equal(secret.toString('hex'), expected.secret, 'Got expected secret');
    }

    return end();
  });
});
