const {test} = require('@alexbosworth/tap');

const {verifyMessage} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'An LND Object is required to verify a message',
    error: [400, 'ExpectedLndForVerifyMessage'],
  },
  {
    args: {lnd: {default: {verifyMessage: ({}, cbk) => {}}}},
    description: 'An message is required to verify a message',
    error: [400, 'ExpectedMessageToVerify'],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => {}}},
      message: 'message',
    },
    description: 'An signature is required to verify a message',
    error: [400, 'ExpectedSignatureToVerifyAgainst'],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => cbk('err')}},
      message: 'message',
      signature: 'signature',
    },
    description: 'Errors are passed back',
    error: [503, 'UnexpectedVerifyMessageError', {err: 'err'}],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => cbk()}},
      message: 'message',
      signature: 'signature',
    },
    description: 'A response is expected',
    error: [503, 'ExpectedResultForVerifyMessageRequest'],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => cbk(null, {})}},
      message: 'message',
      signature: 'signature',
    },
    description: 'Public key is expected',
    error: [503, 'ExpectedPublicKeyInVerifyMessageResponse'],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => cbk(null, {pubkey: '000'})}},
      message: 'message',
      signature: 'signature',
    },
    description: 'Verified',
    expected: {signed_by: '000'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => verifyMessage(args), error, 'Got expected error');
    } else {
      strictSame(await verifyMessage(args), expected, 'Got expected result');
    }

    return end();
  });
});
