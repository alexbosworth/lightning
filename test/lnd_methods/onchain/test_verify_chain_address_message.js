const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {verifyChainAddressMessage} = require('./../../../');

const makeArgs = override => {
  const args = {
    address: 'address',
    lnd: {
      wallet: {
        verifyMessageWithAddr: ({}, cbk) => cbk(null, {
          pubkey: Buffer.alloc(1),
          valid: true,
        }),
      },
    },
    message: 'message',
    signature: '00',
  };

  Object.keys(override).forEach(attr => args[attr] = override[attr]);

  return args;
};

const tests = [
  {
    args: makeArgs({address: undefined}),
    description: 'A chain address is required to verify a message',
    error: [400, 'ExpectedChainAddressToVerifyChainAddressMessage'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to verify a message',
    error: [400, 'ExpectedLndToVerifyChainAddressMessage'],
  },
  {
    args: makeArgs({message: undefined}),
    description: 'A message is required to verify a message',
    error: [400, 'ExpectedChainAddressMessageToVerify'],
  },
  {
    args: makeArgs({signature: undefined}),
    description: 'A signature required to verify a message',
    error: [400, 'ExpectedHexSignatureToVerifyChainAddressMessage'],
  },
  {
    args: makeArgs({
      lnd: {
        wallet: {
          verifyMessageWithAddr: ({}, cbk) => cbk({
            details: 'unknown method VerifyMessageWithAddr for service walletrpc.WalletKit',
          }),
        },
      },
    }),
    description: 'Unsupported error is returned',
    error: [501, 'BackingLndDoesNotSupportVerifyingAddrMessages'],
  },
  {
    args: makeArgs({
      lnd: {wallet: {verifyMessageWithAddr: ({}, cbk) => cbk('err')}},
    }),
    description: 'Unsupported error is returned',
    error: [503, 'UnexpectedVerifyChainAddrMessageError', {err: 'err'}],
  },
  {
    args: makeArgs({
      lnd: {wallet: {verifyMessageWithAddr: ({}, cbk) => cbk()}},
    }),
    description: 'A response is expected',
    error: [503, 'ExpectedResultForVerifyChainMessageRequest'],
  },
  {
    args: makeArgs({
      lnd: {
        wallet: {
          verifyMessageWithAddr: ({}, cbk) => cbk(null, {valid: false}),
        },
      },
    }),
    description: 'A valid result is expected',
    error: [400, 'InvalidSignatureReceivedForChainAddress'],
  },
  {
    args: makeArgs({
      lnd: {
        wallet: {verifyMessageWithAddr: ({}, cbk) => cbk(null, {valid: true})},
      },
    }),
    description: 'A public key result is expected',
    error: [503, 'ExpectedPublicKeyInVerifyChainMessageResponse'],
  },
  {
    args: makeArgs({}),
    description: 'Signature validated',
    expected: {signed_by: '00'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => verifyChainAddressMessage(args), error, 'Got error');
    } else {
      deepStrictEqual(await verifyChainAddressMessage(args), expected, 'Res');
    }

    return;
  });
});
