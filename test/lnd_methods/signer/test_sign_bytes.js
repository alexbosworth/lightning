const {test} = require('@alexbosworth/tap');

const {signBytes} = require('./../../../');

const makeLnd = (err, res) => {
  return {signer: {signMessage: ({}, cbk) => cbk(err, res)}};
};

const makeArgs = ({override, signature}) => {
  const args = {
    key_family: 0,
    key_index: 0,
    lnd: makeLnd(null, {signature: Buffer.from(signature || '00', 'hex')}),
    preimage: '00',
    type: 'ecdsa',
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({override: {key_family: undefined}}),
    description: 'A key family is required',
    error: [400, 'ExpectedKeyFamilyToSignBytes'],
  },
  {
    args: makeArgs({override: {key_index: undefined}}),
    description: 'A key index is required',
    error: [400, 'ExpectedKeyIndexToSignBytes'],
  },
  {
    args: makeArgs({override: {lnd: undefined}}),
    description: 'LND is required',
    error: [400, 'ExpectedLndToSignBytes'],
  },
  {
    args: makeArgs({override: {preimage: undefined}}),
    description: 'A preimage to hash and sign is required',
    error: [400, 'ExpectedHexDataToSignBytes'],
  },
  {
    args: makeArgs({override: {type: 'type'}}),
    description: 'A known signature type is required',
    error: [400, 'ExpectedKnownSignatureTypeToSignBytes'],
  },
  {
    args: makeArgs({
      override: {
        lnd: makeLnd({
          message: '12 UNIMPLEMENTED: unknown service signrpc.Signer',
        }),
      },
    }),
    description: 'Unimplemented error is returned',
    error: [400, 'ExpectedSignerRpcLndBuildTagToSignBytes'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd('err')}}),
    description: 'Unexpected errors are returned',
    error: [503, 'UnexpectedErrorWhenSigningBytes', {err: 'err'}],
  },
  {
    args: makeArgs({override: {lnd: makeLnd()}}),
    description: 'A response is expected',
    error: [503, 'UnexpectedEmptyResponseWhenSigningBytes'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {})}}),
    description: 'A signature is expected',
    error: [503, 'ExpectedSignatureInSignMessageResponse'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {signature: Buffer.alloc(0)})}}),
    description: 'A non empty signature is expected',
    error: [503, 'ExpectedSignatureInSignBytesResponse'],
  },
  {
    args: makeArgs({override: {type: 'schnorr'}}),
    description: 'Schnorr signature is expected to be schnorr sized',
    error: [503, 'UnexpectedSignatureLengthInSignBytesResponse'],
  },
  {
    args: makeArgs({}),
    description: 'Signature is returned for preimage',
    expected: {signature: '00'},
  },
  {
    args: makeArgs({
      override: {type: 'schnorr'}, signature: Buffer.alloc(64).toString('hex'),
    }),
    description: 'Schnorr signature is supported',
    expected: {signature: Buffer.alloc(64).toString('hex')},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(signBytes(args), error, 'Got expected error');
    } else {
      const {signature} = await signBytes(args);

      equal(signature, expected.signature, 'Got expected signature');
    }

    return end();
  });
});
