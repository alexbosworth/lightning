const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToChainSpend} = require('./../../../lnd_methods');
const {subscriptionEvents} = require('./../macros');
const {transaction} = require('./../fixtures/transaction');

const confirmation = {
  event: 'confirmation',
  data: {transaction, height: 200, vin: 0},
};
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const makeLnd = () => ({chain: {registerSpendNtfn: () => {}}});
const makeSpend = overrides => {
  const spend = {
    raw_spending_tx: Buffer.from(transaction, 'hex'),
    spending_height: 200,
    spending_input_index: 0,
  };

  Object.keys(overrides).forEach(k => spend[k] = overrides[k]);

  return {spend};
};
const outputScript = 'a914898ffd60ad6091221250047a9f2bd6456190263487';
const p2shAddress = '3EENzQdQS3BvvnkeJjC5uVwUKFuTczpnok';
const shutDown = {details: 'chain notifier shutting down'};

// The request that LND receives when watching the p2sh address for a spend
const p2shRequest = {
  outpoint: {hash: Buffer.alloc(32), index: 0},
  height_hint: 100,
  script: Buffer.from(outputScript, 'hex'),
};

const tests = [
  {
    args: {
      min_height: 100,
      output_script: outputScript,
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
    },
    description: 'Confirmation emitted for chain spend',
    expected: {events: [confirmation], requests: [p2shRequest]},
  },
  {
    args: {
      min_height: 100,
      output_script: outputScript,
      transaction_id: `${Buffer.alloc(31).toString('hex')}01`,
      transaction_vout: 1,
    },
    description: 'The spend request is derived from the arguments',
    expected: {
      events: [confirmation],
      requests: [{
        outpoint: {
          hash: Buffer.concat([Buffer.from('01', 'hex'), Buffer.alloc(31)]),
          index: 1,
        },
        height_hint: 100,
        script: Buffer.from(outputScript, 'hex'),
      }],
    },
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Confirmation emitted for a spend from an address',
    expected: {events: [confirmation]},
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A reorg is emitted',
    expected: {events: [{event: 'reorg', data: undefined}]},
    stream: [['data', {reorg: {}}]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Unreadable spend data is an error',
    expected: {
      events: [{event: 'error', data: new Error('ExpectedSpendConfEvent')}],
    },
    stream: [['data', undefined]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Data without a spend or a reorg is an error',
    expected: {
      events: [{event: 'error', data: new Error('ExpectedSpendTxReorgEvent')}],
    },
    stream: [['data', {}]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A spend without a raw transaction is an error',
    expected: {
      events: [{event: 'error', data: new Error('ExpectedRawTxInSpendConf')}],
    },
    stream: [['data', makeSpend({raw_spending_tx: undefined})]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A spend without a height is an error',
    expected: {
      events: [{event: 'error', data: new Error('ExpectedHeightInSpendConf')}],
    },
    stream: [['data', makeSpend({spending_height: undefined})]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A spend without an input index is an error',
    expected: {
      events: [{event: 'error', data: new Error('ExpectedVinInSpendConf')}],
    },
    stream: [['data', makeSpend({spending_input_index: undefined})]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Unreadable spend data is ignored without an error listener',
    expected: {events: [confirmation]},
    listening: ['confirmation', 'reorg'],
    stream: [['data', undefined], ['data', makeSpend({})]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A throwing listener is reported without ending the stream',
    expected: {
      events: [confirmation, listenerFailure, confirmation, listenerFailure],
    },
    stream: [['data', makeSpend({})], ['data', makeSpend({})]],
    throwing: ['confirmation'],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A chain notifier shutdown stops relaying from the stream',
    expected: {events: [{event: 'error', data: shutDown}]},
    stream: [['error', shutDown], ['data', makeSpend({})]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A stream error is relayed',
    expected: {
      events: [{event: 'error', data: {details: 'err'}}, confirmation],
    },
    stream: [['error', {details: 'err'}], ['data', makeSpend({})]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Stream errors are ignored without an error listener',
    expected: {events: []},
    listening: ['confirmation', 'reorg'],
    stream: [['error', {details: 'err'}]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Status and end events are relayed',
    expected: {
      events: [
        {event: 'status', data: 'status'},
        {event: 'end', data: undefined},
      ],
    },
    stream: [['status', 'status'], ['end']],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Removing the last spend listener cancels the stream',
    expected: {cancels: ['cancel'], events: []},
    removing: ['confirmation', 'reorg'],
    stream: [],
  },
  {
    args: {},
    description: 'An lnd is required',
    error: 'ExpectedLndGrpcApiToSubscribeToSpendConfirmations',
  },
  {
    args: {lnd: makeLnd()},
    description: 'Min height is required',
    error: 'ExpectedMinHeightToSubscribeToChainSpend',
  },
  {
    args: {lnd: makeLnd(), min_height: 1},
    description: 'An address or output script is required',
    error: 'ExpectedRecognizedAddressFormatToWatchForSpend',
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToChainSpend(args), new Error(error), 'Got error');

      return;
    }

    const requests = [];

    const got = await subscriptionEvents({
      ...scenario,
      events: ['confirmation', 'end', 'error', 'reorg', 'status'],
      stream: scenario.stream || [['data', makeSpend({})]],
      subscribe: stream => {
        args.lnd = {
          chain: {
            registerSpendNtfn: request => {
              requests.push(request);

              return stream;
            },
          },
        };

        return subscribeToChainSpend(args);
      },
    });

    deepStrictEqual(
      {...got, requests},
      {cancels: [], requests: [p2shRequest], ...expected},
      'Got expected events'
    );

    return;
  });
});
