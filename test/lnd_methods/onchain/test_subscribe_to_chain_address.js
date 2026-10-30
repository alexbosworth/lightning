const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToChainAddress} = require('./../../../lnd_methods');
const {subscriptionEvents} = require('./../macros');
const {transaction} = require('./../fixtures/transaction');

const confirmation = {
  event: 'confirmation',
  data: {
    transaction,
    block: Buffer.alloc(32).toString('hex'),
    height: 200,
  },
};
const confirmed = {
  conf: {
    block_hash: Buffer.alloc(32),
    block_height: 200,
    raw_tx: Buffer.from(transaction, 'hex'),
  },
};
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const makeLnd = () => ({chain: {registerConfirmationsNtfn: () => {}}});
const outputScript = 'a914898ffd60ad6091221250047a9f2bd6456190263487';
const p2shAddress = '3EENzQdQS3BvvnkeJjC5uVwUKFuTczpnok';
const shutDown = {details: 'chain notifier shutting down'};

// The request that LND receives when watching the p2sh address
const p2shRequest = {
  height_hint: 100,
  num_confs: 1,
  script: Buffer.from(outputScript, 'hex'),
  txid: Buffer.alloc(32),
};

const tests = [
  {
    args: {
      min_confirmations: 6,
      min_height: 100,
      output_script: outputScript,
      transaction_id: Buffer.alloc(32).toString('hex'),
    },
    description: 'Confirmation emitted for output script',
    expected: {
      events: [confirmation],
      requests: [{
        height_hint: 100,
        num_confs: 6,
        script: Buffer.from(outputScript, 'hex'),
        txid: Buffer.alloc(32),
      }],
    },
  },
  {
    args: {
      min_confirmations: 6,
      min_height: 100,
      p2sh_address: p2shAddress,
      transaction_id: `${Buffer.alloc(31).toString('hex')}01`,
    },
    description: 'Confirmation on p2sh emitted',
    expected: {
      events: [confirmation],
      requests: [{
        height_hint: 100,
        num_confs: 6,
        script: Buffer.from(outputScript, 'hex'),
        txid: Buffer.concat([Buffer.from('01', 'hex'), Buffer.alloc(31)]),
      }],
    },
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A reorg is emitted',
    expected: {events: [{event: 'reorg', data: undefined}]},
    stream: [['data', {reorg: {}}]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Data without a confirmation is ignored',
    expected: {events: []},
    stream: [['data', {}]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Unreadable confirmation data is an error',
    expected: {
      events: [{event: 'error', data: new Error('ExpectedDataForConfEvent')}],
    },
    stream: [['data', undefined]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'Unreadable data is ignored without an error listener',
    expected: {events: [confirmation]},
    listening: ['confirmation', 'reorg'],
    stream: [['data', undefined], ['data', confirmed]],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A throwing listener is reported without ending the stream',
    expected: {
      events: [confirmation, listenerFailure, confirmation, listenerFailure],
    },
    stream: [['data', confirmed], ['data', confirmed]],
    throwing: ['confirmation'],
  },
  {
    args: {min_height: 100, p2sh_address: p2shAddress},
    description: 'A chain notifier shutdown is relayed as an error',
    expected: {events: [{event: 'error', data: shutDown}]},
    stream: [['error', shutDown]],
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
    description: 'Removing the last confirmation listener cancels the stream',
    expected: {cancels: ['cancel'], events: []},
    removing: ['error', 'confirmation', 'reorg'],
    stream: [],
  },
  {
    args: {},
    description: 'Lnd is required to subscribe',
    error: 'ExpectedLndGrpcApiToSubscribeToChainTransaction',
  },
  {
    args: {lnd: makeLnd()},
    description: 'Min height is required',
    error: 'ExpectedMinHeightToSubscribeToChainAddress',
  },
  {
    args: {lnd: makeLnd(), min_height: 1},
    description: 'An output to watch for is required',
    error: 'ExpectedChainAddressToSubscribeForConfirmationEvents',
  },
  {
    args: {bech32_address: 'bech32', lnd: makeLnd(), min_height: 1},
    description: 'A recognized address format is required',
    error: 'ExpectedRecognizedAddressFormatToWatchForScript',
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToChainAddress(args), new Error(error), 'Got err');

      return;
    }

    const requests = [];

    const got = await subscriptionEvents({
      ...scenario,
      events: ['confirmation', 'end', 'error', 'reorg', 'status'],
      stream: scenario.stream || [['data', confirmed]],
      subscribe: stream => {
        args.lnd = {
          chain: {
            registerConfirmationsNtfn: request => {
              requests.push(request);

              return stream;
            },
          },
        };

        return subscribeToChainAddress(args);
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
