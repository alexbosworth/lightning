const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {sendToChainAddresses} = require('./../../../lnd_methods');

const makeArgs = overrides => {
  const args = {
    lnd: {
      default: {
        sendMany: ({}, cbk) => cbk(null, {
          txid: Buffer.alloc(32).toString('hex'),
        }),
      },
    },
    send_to: [{address: 'address', tokens: 1}],
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    confirmation_count: 0,
    id: Buffer.alloc(32).toString('hex'),
    is_confirmed: false,
    is_outgoing: true,
    tokens: 1,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'Expected lnd to send to chain address',
    error: [400, 'ExpectedLndToSendToChainAddresses'],
  },
  {
    args: makeArgs({send_to: undefined}),
    description: 'Expected address to send to chain address',
    error: [400, 'ExpectedSendToAddressesAndTokens'],
  },
  {
    args: makeArgs({send_to: []}),
    description: 'Expected address to send to chain address',
    error: [400, 'ExpectedSendToAddressesAndTokens'],
  },
  {
    args: makeArgs({send_to: [{tokens: 1}]}),
    description: 'Expected address to send to chain address',
    error: [400, 'ExpectedAddrsAndTokensWhenSendingToAddresses'],
  },
  {
    args: makeArgs({send_to: [{address: 'address'}]}),
    description: 'Expected address to send to chain address',
    error: [400, 'ExpectedAddrsAndTokensWhenSendingToAddresses'],
  },
  {
    args: makeArgs({wss: 'wss'}),
    description: 'A wss array is expected to send to chain addresses',
    error: [400, 'ExpectedWssArrayForSendToChainAddresses'],
  },
  {
    args: makeArgs({wss: ['wss']}),
    description: 'A log method is expected to send to chain addresses',
    error: [400, 'ExpectedLogForChainSendWebSocketAnnouncement'],
  },
  {
    args: makeArgs({lnd: {default: {sendMany: ({}, cbk) => cbk('err')}}}),
    description: 'An LND error is passed back',
    error: [500, 'UnexpectedSendManyError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {default: {sendMany: ({}, cbk) => cbk()}}}),
    description: 'A response is expected',
    error: [500, 'ExpectedResponseFromSendManyRequest'],
  },
  {
    args: makeArgs({lnd: {default: {sendMany: ({}, cbk) => cbk(null, {})}}}),
    description: 'A tx id is expected',
    error: [500, 'ExpectedTxIdForSendManyTransaction'],
  },
  {
    args: makeArgs({log: console.log, wss: [{clients: [null]}]}),
    description: 'Send coins with null wss client',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({log: console.log, wss: [{clients: [{}]}]}),
    description: 'Send coins with no ready state',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({log: () => {}, wss: [{clients: [{readyState: 1}]}]}),
    description: 'Send coins with no send method',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      log: () => {},
      wss: [{clients: [{readyState: 1, send: () => {}}]}],
    }),
    description: 'Send coins with broadcast',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({}),
    description: 'Send coins',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({fee_tokens_per_vbyte: 1}),
    description: 'Send coins with fee rate',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({utxo_selection: 'random'}),
    description: 'Send coins with coin selection',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => sendToChainAddresses(args), error, 'Got err');
    } else {
      const res = await sendToChainAddresses(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
