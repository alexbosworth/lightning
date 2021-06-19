const {test} = require('@alexbosworth/tap');

const {signMessage} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'An LND Object is required to sign a message',
    error: [400, 'ExpectedLndToSignMessage'],
  },
  {
    args: {lnd: {default: {signMessage: ({}, cbk) => {}}}},
    description: 'An message is required to sign a message',
    error: [400, 'ExpectedMessageToSign'],
  },
  {
    args: {
      lnd: {default: {signMessage: ({}, cbk) => cbk('err')}},
      message: 'message',
    },
    description: 'Errors are passed back',
    error: [503, 'UnexpectedSignMessageError', {err: 'err'}],
  },
  {
    args: {
      lnd: {default: {signMessage: ({}, cbk) => cbk()}},
      message: 'message',
    },
    description: 'A response is expected',
    error: [503, 'ExpectedResponseToSignMessageRequest'],
  },
  {
    args: {
      lnd: {default: {signMessage: ({}, cbk) => cbk(null, {})}},
      message: 'message',
    },
    description: 'Signature is expected',
    error: [503, 'ExpectedSignatureForMessageSignRequest'],
  },
  {
    args: {
      lnd: {default: {signMessage: ({}, cbk) => cbk(null, {signature: 's'})}},
      message: 'message',
    },
    description: 'Signature produced',
    expected: {signature: 's'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => signMessage(args), error, 'Got expected error');
    } else {
      strictSame(await signMessage(args), expected, 'Got expected result');
    }

    return end();
  });
});
