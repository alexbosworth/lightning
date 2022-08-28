const {test} = require('@alexbosworth/tap');

const {sendToChainAddress} = require('./../../../lnd_methods');

const makeArgs = overrides => {
  const args = {
    address: 'address',
    lnd: {
      default: {
        sendCoins: ({}, cbk) => cbk(null, {
          txid: Buffer.alloc(32).toString('hex'),
        }),
      },
    },
    tokens: 1,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({address: undefined}),
    description: 'Expected address to send to chain address',
    error: [400, 'ExpectedChainAddressToSendTo'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'Expected lnd to send to chain address',
    error: [400, 'ExpectedLndForChainSendRequest'],
  },
  {
    args: makeArgs({tokens: undefined}),
    description: 'Expected tokens to send to chain address',
    error: [400, 'MissingTokensToSendOnChain'],
  },
  {
    args: makeArgs({tokens: 0.1}),
    description: 'Expected non-fractional tokens to send to chain address',
    error: [400, 'ExpectedWholeNumberAmountToSendFundsOnChain'],
  },
  {
    args: makeArgs({is_send_all: true, tokens: 1}),
    description: 'Expected either send all or tokens to send to chain address',
    error: [400, 'ExpectedNoTokensSpecifiedWhenSendingAllFunds'],
  },
  {
    args: makeArgs({wss: 'wss'}),
    description: 'A wss array is expected to send to chain address',
    error: [400, 'ExpectedWssArrayForChainSend'],
  },
  {
    args: makeArgs({wss: ['wss']}),
    description: 'A log method is expected to send to chain address',
    error: [400, 'ExpectedLogFunctionForChainSendSocketAnnounce'],
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          sendCoins: ({}, cbk) => cbk({
            details: 'insufficient funds available to construct transaction',
          }),
        },
      }
    }),
    description: 'Low funds error is returned',
    error: [503, 'InsufficientBalanceToSendToChainAddress'],
  },
  {
    args: makeArgs({lnd: {default: {sendCoins: ({}, cbk) => cbk('err')}}}),
    description: 'An LND error is passed back',
    error: [500, 'UnexpectedSendCoinsError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {default: {sendCoins: ({}, cbk) => cbk()}}}),
    description: 'A response is expected',
    error: [500, 'ExpectedResponseFromSendCoinsRequest'],
  },
  {
    args: makeArgs({lnd: {default: {sendCoins: ({}, cbk) => cbk(null, {})}}}),
    description: 'A tx id is expected',
    error: [500, 'ExpectedTransactionIdForSendCoinsTransaction'],
  },
  {
    args: makeArgs({log: console.log, wss: [{clients: [null]}]}),
    description: 'Send coins with null wss client',
    expected: {
      confirmation_count: 0,
      id: Buffer.alloc(32).toString('hex'),
      is_confirmed: false,
      is_outgoing: true,
      tokens: 1,
    },
  },
  {
    args: makeArgs({log: console.log, wss: [{clients: [{}]}]}),
    description: 'Send coins with no ready state',
    expected: {
      confirmation_count: 0,
      id: Buffer.alloc(32).toString('hex'),
      is_confirmed: false,
      is_outgoing: true,
      tokens: 1,
    },
  },
  {
    args: makeArgs({log: () => {}, wss: [{clients: [{readyState: 1}]}]}),
    description: 'Send coins with no send method',
    expected: {
      confirmation_count: 0,
      id: Buffer.alloc(32).toString('hex'),
      is_confirmed: false,
      is_outgoing: true,
      tokens: 1,
    },
  },
  {
    args: makeArgs({
      is_send_all: true,
      log: () => {},
      wss: [{clients: [{readyState: 1, send: () => {}}]}],
      tokens: undefined,
    }),
    description: 'Send coins with broadcast',
    expected: {
      confirmation_count: 0,
      id: Buffer.alloc(32).toString('hex'),
      is_confirmed: false,
      is_outgoing: true,
      tokens: undefined,
    },
  },
  {
    args: makeArgs({}),
    description: 'Send coins',
    expected: {
      confirmation_count: 0,
      id: Buffer.alloc(32).toString('hex'),
      is_confirmed: false,
      is_outgoing: true,
      tokens: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => sendToChainAddress(args), error, 'Got err');
    } else {
      const res = await sendToChainAddress(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
