const {test} = require('@alexbosworth/tap');
const {Transaction} = require('bitcoinjs-lib');

const {sendToChainOutputScripts} = require('./../../../lnd_methods');

const makeArgs = overrides => {
  const args = {
    lnd: {
      wallet: {
        sendOutputs: ({}, cbk) => cbk(null, {
          raw_tx: new Transaction().toBuffer(),
        }),
      },
    },
    send_to: [{script: '00', tokens: 1}],
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'Expected lnd to send to chain scripts',
    error: [400, 'ExpectedLndToSendToChainOutputScripts'],
  },
  {
    args: makeArgs({send_to: undefined}),
    description: 'Expected outputs to send to chain scripts',
    error: [400, 'ExpectedSendToOutputScriptsAndTokens'],
  },
  {
    args: makeArgs({lnd: {wallet: {sendOutputs: ({}, cbk) => cbk('err')}}}),
    description: 'An LND error is passed back',
    error: [500, 'UnexpectedSendToChainOutputScriptsErr', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {wallet: {sendOutputs: ({}, cbk) => cbk()}}}),
    description: 'A response is expected',
    error: [500, 'ExpectedResponseForSendToChainOutputsRequest'],
  },
  {
    args: makeArgs({lnd: {wallet: {sendOutputs: ({}, cbk) => cbk(null, {})}}}),
    description: 'A raw tx is expected',
    error: [500, 'ExpectedRawTransactionInSendToOutputsResponse'],
  },
  {
    args: makeArgs({}),
    description: 'Send coins',
    expected: {
      confirmation_count: 0,
      id: 'd21633ba23f70118185227be58a63527675641ad37967e2aa461559f577aec43',
      is_confirmed: false,
      is_outgoing: true,
      tokens: 1,
      transaction: '01000000000000000000',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => sendToChainOutputScripts(args), error, 'Got err');
    } else {
      const res = await sendToChainOutputScripts(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
