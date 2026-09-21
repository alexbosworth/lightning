const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {verifyBytesSignature} = require('./../../../');

const makeLnd = (err, res) => {
  return {signer: {verifyMessage: ({}, cbk) => cbk(err, res)}};
};

const makeArgs = ({override}) => {
  const args = {
    lnd: makeLnd(null, {valid: true}),
    preimage: Buffer.alloc(32).toString('hex'),
    public_key: Buffer.alloc(33).toString('hex'),
    signature: '00',
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({override: {lnd: undefined}}),
    description: 'LND is required to verify bytes signature',
    error: [400, 'ExpectedLndToVerifyBytesSignature'],
  },
  {
    args: makeArgs({override: {preimage: undefined}}),
    description: 'A preimage is required to verify bytes signature',
    error: [400, 'ExpectedPreimageToVerifyBytesSignature'],
  },
  {
    args: makeArgs({override: {public_key: undefined}}),
    description: 'A public key is required to verify bytes signature',
    error: [400, 'ExpectedPublicKeyToVerifyBytesSignature'],
  },
  {
    args: makeArgs({override: {signature: undefined}}),
    description: 'A signature is required to verify bytes signature',
    error: [400, 'ExpectedSignatureToVerifyBytesSignature'],
  },
  {
    args: makeArgs({override: {tag: 1}}),
    description: 'A tag is expected to be a string',
    error: [400, 'ExpectedNonEmptyTagStringToVerifyBytesSignature'],
  },
  {
    args: makeArgs({override: {tag: ''}}),
    description: 'A tag is expected to be non empty',
    error: [400, 'ExpectedNonEmptyTagStringToVerifyBytesSignature'],
  },
  {
    args: makeArgs({override: {tag: 'tag'}}),
    description: 'A tag requires a schnorr signature',
    error: [400, 'ExpectedSchnorrSignatureToVerifyTaggedBytes'],
  },
  {
    args: makeArgs({
      override: {
        lnd: makeLnd({
          message: '12 UNIMPLEMENTED: unknown service signrpc.Signer',
        }),
      },
    }),
    description: 'Unsupported method returns error',
    error: [400, 'ExpectedSignerRpcLndBuildTagToVerifySignBytes'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd('err')}}),
    description: 'Unexpected error returns error',
    error: [503, 'UnexpectedErrWhenVerifyingSignedBytes', {err: 'err'}],
  },
  {
    args: makeArgs({override: {lnd: makeLnd()}}),
    description: 'No response returns error',
    error: [503, 'UnexpectedEmptyResponseWhenVerifyingBytesSig'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {})}}),
    description: 'No valid attribute returns error',
    error: [503, 'ExpectedValidStateOfSignatureOverBytes'],
  },
  {
    args: makeArgs({}),
    description: 'No valid attribute returns error',
    expected: {is_valid: true},
  },
  {
    args: makeArgs({
      override: {
        lnd: {
          signer: {
            verifyMessage: (args, cbk) => {
              if (args.tag !== undefined) {
                return cbk([500, 'ExpectedNoTagInVerifyMessageRequest']);
              }

              return cbk(null, {valid: true});
            },
          },
        },
      },
    }),
    description: 'No tag is passed when no tag is specified',
    expected: {is_valid: true},
  },
  {
    args: makeArgs({
      override: {
        lnd: {
          signer: {
            verifyMessage: (args, cbk) => {
              if (!Buffer.isBuffer(args.tag)) {
                return cbk([500, 'ExpectedTagBytesInVerifyMessageRequest']);
              }

              if (args.tag.toString('utf8') !== 'BIP0322-signed-message') {
                return cbk([500, 'ExpectedUtf8TagInVerifyMessageRequest']);
              }

              if (args.is_schnorr_sig !== true) {
                return cbk([500, 'ExpectedSchnorrSigInVerifyMessageRequest']);
              }

              return cbk(null, {valid: true});
            },
          },
        },
        public_key: Buffer.alloc(32).toString('hex'),
        signature: Buffer.alloc(64).toString('hex'),
        tag: 'BIP0322-signed-message',
      },
    }),
    description: 'A tag is passed as utf8 bytes to verify a tagged hash',
    expected: {is_valid: true},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(verifyBytesSignature(args), error, 'Got expected error');
    } else {
      const validity = await verifyBytesSignature(args);

      deepStrictEqual(validity.is_valid, expected.is_valid, 'Got validity');
    }

    return;
  });
});
