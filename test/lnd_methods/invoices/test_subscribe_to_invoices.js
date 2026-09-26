const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const test = require('node:test');
const {throws} = require('node:assert').strict;
const {timers} = require('node:test').mock;

const {lookupInvoiceResponse} = require('./../fixtures');
const {subscribeToInvoices} = require('./../../../');

const cancelErr = new Error('Cancelled');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const grpcErr = (code, details) => {
  return Object.assign(new Error(details), {code, details});
};
const lockedMessage = 'wallet locked, unlock it to enable full RPC access';
const noCursors = {add_index: undefined, settle_index: undefined};
const restartDelayMs = 1;
const restartWaitMs = 20;
const startErr = new Error('Channel has been shut down');
const streamErr = new Error('error');
const streamFailure = [503, 'UnexpectedInvoiceSubscriptionError', {
  err: streamErr,
}];

// LND refuses a subscription with an unknown code and a permission message
const deniedErr = grpcErr(2, 'permission denied');
const expiredErr = grpcErr(2, 'verification failed: macaroon has expired');
const garbageErr = grpcErr(2, 'unmarshal v1: invalid macaroon');
const missingErr = grpcErr(2, 'expected 1 macaroon, got 0');
const lockedErr = grpcErr(2, lockedMessage);
const unimplementedErr = grpcErr(12, 'unknown service lnrpc.Lightning');

// Expected errors for a refused subscription
const denied = err => [403, 'PermissionDeniedToSubscribeToInvoices', {err}];
const rejected = err => [503, 'SubscriptionToInvoicesRejected', {err}];

const expectedInvoice = {
  chain_address: undefined,
  cltv_delta: 1,
  confirmed_at: undefined,
  confirmed_index: 1,
  created_at: '1970-01-01T00:00:01.000Z',
  description: '',
  description_hash: undefined,
  expires_at: '1970-01-01T00:00:02.000Z',
  features: [],
  id: '0000000000000000000000000000000000000000000000000000000000000000',
  index: 1,
  is_canceled: true,
  is_confirmed: false,
  is_held: undefined,
  is_private: false,
  is_push: undefined,
  mtokens: '1000',
  payment: undefined,
  payments: [],
  received: 0,
  received_mtokens: '0',
  request: 'request',
  secret: '0000000000000000000000000000000000000000000000000000000000000000',
  tokens: 1
};

// Newest invoices as returned by LND for looking up resume cursors
const newestInvoices = {
  first_index_offset: '4',
  invoices: [
    {add_index: '4', settle_index: '3'},
    {add_index: '5', settle_index: '0'},
  ],
};

// Make an invoice message with an add index and optional settle index
const rpcInvoice = ({add, amp, settle}) => ({
  ...lookupInvoiceResponse({}),
  add_index: String(add),
  // An AMP invoice is settled by HTLC set, the settle index is on the set
  amp_invoice_state: !amp ? {} : {
    '00': {
      amt_paid_msat: '1000',
      settle_index: String(amp),
      settle_time: '1',
      state: 'SETTLED',
    },
  },
  is_amp: !!amp,
  settle_index: String(settle || 0),
  state: !!settle || !!amp ? 'SETTLED' : 'OPEN',
});

// An invoice message that cannot be read
const malformedInvoice = {
  ...rpcInvoice({add: 10}),
  is_amp: false,
  is_keysend: false,
  payment_request: '',
};

// Steps to emit data for a settlement
const settle = n => ({data: rpcInvoice({add: n, settle: n}), emit: 'data'});

// An expected update for a settlement
const settled = n => ({confirmed_index: n, index: n});

// Steps to fail the stream and wait for the resubscribe
const failAndResubscribe = [
  {data: streamErr, emit: 'error'},
  {wait: restartWaitMs},
];

/** Make an LND that records each subscription attempt

  Responses to listInvoices are given in order, a missing response leaves the
  lookup pending so that it can be resolved by a later step
*/
const makeLnd = ({err, listInvoices}) => {
  const lookups = [];
  const subscriptions = [];

  const lnd = {
    default: {
      subscribeInvoices: args => {
        if (!!err) {
          throw err;
        }

        const subscription = new EventEmitter();

        subscription.args = args;
        subscription.cancel = () => subscription.is_canceled = true;

        subscriptions.push(subscription);

        return subscription;
      },
    },
  };

  if (!!listInvoices) {
    lnd.default.listInvoices = (args, cbk) => {
      lookups.push(cbk);

      const response = listInvoices.shift();

      if (!response) {
        return;
      }

      if (!!response.err) {
        return cbk(response.err);
      }

      return cbk(null, response);
    };
  }

  return {lnd, lookups, subscriptions};
};

/** Run a test step

  {data, emit}: emit on the latest subscription
  {remove: true}: remove all listeners
  {remove: <event>}: remove the listeners of an event
  {res, resolve}: resolve pending lookup number `resolve` with `res`
  {tick}: move mocked timers forward by milliseconds
  {wait}: wait milliseconds
*/
const runStep = async ({got, mock, step, sub}) => {
  if (!!step.tick) {
    return timers.tick(step.tick);
  }

  if (!!step.wait) {
    return await delay(step.wait);
  }

  if (step.remove === true) {
    return sub.removeAllListeners();
  }

  if (!!step.remove) {
    return sub.removeAllListeners(step.remove);
  }

  if (step.resolve !== undefined) {
    return mock.lookups[step.resolve](null, step.res);
  }

  const [subscription] = mock.subscriptions.slice(-1);

  try {
    return subscription.emit(step.emit, step.data);
  } catch (err) {
    return got.thrown.push(err.message);
  }
};

/** Record what a subscription emits

  {
    got: <Recorded Events Object>
    sub: <Subscription EventEmitter Object>
    [throwing]: <Make Listener Throw on 'error' or 'first_update' String>
  }
*/
const recordEvents = ({got, sub, throwing}) => {
  sub.on('end', () => got.events.push('end'));

  sub.on('error', err => {
    got.errors.push(err);
    got.events.push('error');

    if (throwing === 'error') {
      throw new Error('ListenerFailure');
    }
  });

  sub.on('invoice_updated', invoice => {
    got.invoices.push(invoice);

    if (throwing === 'first_update' && got.invoices.length === 1) {
      throw new Error('ListenerFailure');
    }
  });

  sub.on('status', status => got.statuses.push(status));

  return;
};

/** Subscribe with a mock LND, run the steps, and report what happened

  {
    args: <Subscribe to Invoices Arguments Object>
    [lnd]: <Make LND Arguments Object>
    [mockTimers]: <Use Mocked Timers Bool>
    [steps]: [<Step Object>]
    [throwing]: <Make Listener Throw on 'error' or 'first_update' String>
  }

  @returns via Promise
  {
    errors: [<Emitted Error Object>]
    events: [<Emitted End or Error Event Name String>]
    invoices: [<Emitted Invoice Object>]
    lookups: <Resume Cursor Lookups Count Number>
    removeListeners: <Remove Listener Listeners Count Number>
    statuses: [<Emitted Status Object>]
    subscriptions: [{
      args: <LND Subscribe Invoices Arguments Object>
      is_canceled: <Subscription Is Canceled Bool>
    }]
    thrown: [<Error Thrown From Step Message String>]
    updates: [{
      confirmed_index: <Emitted Invoice Confirmed Index Number>
      index: <Emitted Invoice Index Number>
    }]
  }
*/
const observeSubscription = async scenario => {
  const {args, lnd, mockTimers, steps, throwing} = scenario;

  const mock = makeLnd(lnd || {});

  const got = {
    errors: [],
    events: [],
    invoices: [],
    statuses: [],
    thrown: [],
  };

  if (!!mockTimers) {
    timers.enable({apis: ['setTimeout']});
  }

  // Use a short restart delay unless the test sets one, even to undefined
  const hasDelay = 'restart_delay_ms' in args;

  const sub = subscribeToInvoices({
    ...args,
    lnd: mock.lnd,
    restart_delay_ms: hasDelay ? args.restart_delay_ms : restartDelayMs,
  });

  recordEvents({got, sub, throwing});

  for (const step of steps || []) {
    await runStep({got, mock, step, sub});
  }

  // Take the results before removing listeners, which cancels subscriptions
  const res = {
    ...got,
    lookups: mock.lookups.length,
    removeListeners: sub.listenerCount('removeListener'),
    subscriptions: mock.subscriptions.map(subscription => ({
      args: subscription.args,
      is_canceled: subscription.is_canceled,
    })),
    updates: got.invoices.map(invoice => ({
      confirmed_index: invoice.confirmed_index,
      index: invoice.index,
    })),
  };

  sub.removeAllListeners();

  if (!!mockTimers) {
    timers.reset();
  }

  return res;
};

const tests = [
  {
    args: {},
    description: 'LND is expected to subscribe to invoices',
    error: 'ExpectedAuthenticatedLndToSubscribeInvoices',
  },
  {
    args: {},
    description: 'Subscribe to invoices returns invoices',
    expected: {
      errors: [],
      invoices: [expectedInvoice],
      statuses: ['status'],
      subscriptions: [{args: noCursors, is_canceled: undefined}],
    },
    steps: [
      {data: lookupInvoiceResponse({}), emit: 'data'},
      {data: 'status', emit: 'status'},
    ],
  },
  {
    args: {added_after: 1, confirmed_after: 2},
    description: 'Subscribe to invoices with cursors passes them to LND',
    expected: {
      subscriptions: [{
        args: {add_index: '1', settle_index: '2'},
        is_canceled: undefined,
      }],
    },
  },
  {
    args: {},
    description: 'A stream failure resubscribes without emitting an error',
    expected: {
      errors: [],
      events: [],
      subscriptions: [
        {args: noCursors, is_canceled: true},
        {args: noCursors, is_canceled: undefined},
      ],
    },
    steps: [
      // gRPC emits an error followed by an end when a stream fails
      {data: streamErr, emit: 'error'},
      {emit: 'end'},
      {wait: restartWaitMs},
    ],
  },
  {
    args: {},
    description: 'A failure with no invoice listener ends with the error',
    expected: {
      errors: [streamFailure],
      events: ['error', 'end'],
      subscriptions: [{args: noCursors, is_canceled: true}],
    },
    steps: [
      {remove: 'invoice_updated'},
      {data: streamErr, emit: 'error'},
      {wait: restartWaitMs},
    ],
  },
  {
    args: {},
    description: 'A permission denied subscription ends without retrying',
    expected: {
      errors: [denied(deniedErr)],
      events: ['error', 'end'],
      subscriptions: [{args: noCursors, is_canceled: true}],
    },
    steps: [
      {data: deniedErr, emit: 'error'},
      // gRPC ends the stream after the error, which must not resubscribe
      {emit: 'end'},
      {wait: restartWaitMs},
    ],
  },
  {
    args: {},
    description: 'A missing macaroon ends the subscription without retrying',
    expected: {
      errors: [denied(missingErr)],
      events: ['error', 'end'],
      subscriptions: [{args: noCursors, is_canceled: true}],
    },
    steps: [{data: missingErr, emit: 'error'}, {wait: restartWaitMs}],
  },
  {
    args: {},
    description: 'An unreadable macaroon ends the subscription',
    expected: {
      errors: [denied(garbageErr)],
      events: ['error', 'end'],
      subscriptions: [{args: noCursors, is_canceled: true}],
    },
    steps: [{data: garbageErr, emit: 'error'}, {wait: restartWaitMs}],
  },
  {
    args: {},
    description: 'A rejected macaroon ends the subscription without retrying',
    expected: {
      errors: [denied(expiredErr)],
      events: ['error', 'end'],
      subscriptions: [{args: noCursors, is_canceled: true}],
    },
    steps: [{data: expiredErr, emit: 'error'}, {wait: restartWaitMs}],
  },
  {
    args: {},
    description: 'An unimplemented subscription ends without retrying',
    expected: {
      errors: [rejected(unimplementedErr)],
      events: ['error', 'end'],
      subscriptions: [{args: noCursors, is_canceled: true}],
    },
    steps: [{data: unimplementedErr, emit: 'error'}, {wait: restartWaitMs}],
  },
  {
    args: {},
    description: 'A locked wallet is retried',
    expected: {
      errors: [],
      events: [],
      subscriptions: [
        {args: noCursors, is_canceled: true},
        {args: noCursors, is_canceled: undefined},
      ],
    },
    steps: [{data: lockedErr, emit: 'error'}, {wait: restartWaitMs}],
  },
  {
    args: {},
    description: 'A clean end resubscribes without an error',
    expected: {
      errors: [],
      subscriptions: [
        {args: noCursors, is_canceled: true},
        {args: noCursors, is_canceled: undefined},
      ],
    },
    steps: [{emit: 'end'}, {wait: restartWaitMs}],
  },
  {
    args: {confirmed_after: 7},
    description: 'Resubscribe cursors only move forward',
    expected: {
      subscriptions: [
        {args: {add_index: undefined, settle_index: '7'}, is_canceled: true},
        {args: {add_index: '51', settle_index: '8'}, is_canceled: undefined},
      ],
    },
    steps: [
      // An unsettled invoice must not clear the settle cursor
      {data: rpcInvoice({add: 50}), emit: 'data'},
      // A settle of an older invoice must not rewind the add cursor
      {data: rpcInvoice({add: 3, settle: 8}), emit: 'data'},
      {data: rpcInvoice({add: 51}), emit: 'data'},
      ...failAndResubscribe,
    ],
  },
  {
    args: {added_after: 100, confirmed_after: 10},
    description: 'A disconnect during added invoice replay preserves settlements',
    expected: {
      subscriptions: [
        {args: {add_index: '100', settle_index: '10'}, is_canceled: true},
        {args: {add_index: '101', settle_index: '10'}, is_canceled: undefined},
      ],
      updates: [{confirmed_index: 20, index: 101}],
    },
    mockTimers: true,
    steps: [
      // An added invoice may already be settled ahead of older invoices
      {data: rpcInvoice({add: 101, settle: 20}), emit: 'data'},
      {data: streamErr, emit: 'error'},
      {tick: restartDelayMs},
    ],
  },
  {
    args: {added_after: 100, confirmed_after: 10},
    description: 'Interrupted settlement replay resumes before unseen payments',
    expected: {
      subscriptions: [
        {args: {add_index: '100', settle_index: '10'}, is_canceled: true},
        {args: {add_index: '100', settle_index: '10'}, is_canceled: true},
        {args: {add_index: '101', settle_index: '11'}, is_canceled: true},
        {args: {add_index: '101', settle_index: '20'}, is_canceled: true},
        {args: {add_index: '102', settle_index: '20'}, is_canceled: undefined},
      ],
      updates: [
        {confirmed_index: 20, index: 101},
        ...Array.from({length: 9}, (_, i) => ({
          confirmed_index: 11 + i,
          index: 1 + i,
        })),
        {confirmed_index: 30, index: 102},
      ],
    },
    mockTimers: true,
    steps: [
      {data: streamErr, emit: 'error'},
      {tick: restartDelayMs},
      // LND replays additions before replaying settlements in settle order
      {data: rpcInvoice({add: 101, settle: 20}), emit: 'data'},
      {data: rpcInvoice({add: 1, settle: 11}), emit: 'data'},
      {data: streamErr, emit: 'error'},
      {tick: restartDelayMs},
      ...Array.from({length: 8}, (_, i) => ({
        data: rpcInvoice({add: 2 + i, settle: 12 + i}),
        emit: 'data',
      })),
      // The repeated settlement still advances the cursor to 20
      {data: rpcInvoice({add: 101, settle: 20}), emit: 'data'},
      {data: streamErr, emit: 'error'},
      {tick: restartDelayMs},
      // Each restart can begin another added invoice backlog
      {data: rpcInvoice({add: 102, settle: 30}), emit: 'data'},
      {data: streamErr, emit: 'error'},
      {tick: restartDelayMs},
    ],
  },
  {
    args: {added_after: 100, confirmed_after: 10},
    description: 'Repeated new invoices identify the ordered settlement replay',
    expected: {
      subscriptions: [
        {args: {add_index: '100', settle_index: '10'}, is_canceled: true},
        {args: {add_index: '102', settle_index: '11'}, is_canceled: true},
        {args: {add_index: '102', settle_index: '12'}, is_canceled: undefined},
      ],
      updates: [
        {confirmed_index: 12, index: 101},
        {confirmed_index: 11, index: 102},
      ],
    },
    mockTimers: true,
    steps: [
      // Creation order can be the reverse of payment order
      {data: rpcInvoice({add: 101, settle: 12}), emit: 'data'},
      {data: rpcInvoice({add: 102, settle: 11}), emit: 'data'},
      {data: rpcInvoice({add: 102, settle: 11}), emit: 'data'},
      {data: streamErr, emit: 'error'},
      {tick: restartDelayMs},
      {data: rpcInvoice({add: 101, settle: 12}), emit: 'data'},
      {data: streamErr, emit: 'error'},
      {tick: restartDelayMs},
    ],
  },
  {
    args: {},
    description: 'A malformed invoice fails the subscription',
    expected: {
      errors: [[503, 'ExpectedPaymentRequestForInvoice']],
      events: ['error', 'end'],
      subscriptions: [{args: noCursors, is_canceled: true}],
      updates: [],
    },
    steps: [
      {data: malformedInvoice, emit: 'data'},
      // Nothing more is relayed once the subscription failed
      {data: rpcInvoice({add: 11}), emit: 'data'},
      {wait: restartWaitMs},
    ],
  },
  {
    args: {},
    description: 'A malformed invoice ends despite a throwing listener',
    expected: {events: ['error', 'end'], thrown: ['ListenerFailure']},
    steps: [{data: {}, emit: 'data'}],
    throwing: 'error',
  },
  {
    args: {},
    description: 'Data after a stream failure is left for the resubscribe',
    expected: {
      subscriptions: [
        {args: noCursors, is_canceled: true},
        {
          args: {add_index: '1', settle_index: undefined},
          is_canceled: undefined,
        },
      ],
      updates: [{confirmed_index: undefined, index: 1}],
    },
    steps: [
      {data: rpcInvoice({add: 1}), emit: 'data'},
      {data: streamErr, emit: 'error'},
      // A late message from the failed stream is not relayed or counted
      {data: rpcInvoice({add: 2}), emit: 'data'},
      {wait: restartWaitMs},
    ],
  },
  {
    args: {},
    description: 'A throwing invoice listener does not resubscribe',
    expected: {
      errors: [[503, 'ListenerFailure']],
      subscriptions: [{args: noCursors, is_canceled: undefined}],
      updates: [
        {confirmed_index: undefined, index: 1},
        {confirmed_index: undefined, index: 2},
      ],
    },
    steps: [
      {data: rpcInvoice({add: 1}), emit: 'data'},
      {wait: restartWaitMs},
      {data: rpcInvoice({add: 2}), emit: 'data'},
    ],
    throwing: 'first_update',
  },
  {
    args: {restart_delay_ms: undefined},
    description: 'The default restart delay is 30 seconds',
    expected: {
      subscriptions: [
        {args: noCursors, is_canceled: true},
        {args: noCursors, is_canceled: undefined},
      ],
    },
    mockTimers: true,
    steps: [{data: streamErr, emit: 'error'}, {tick: 30000}],
  },
  {
    args: {restart_delay_ms: undefined},
    description: 'There is no resubscribe before the default restart delay',
    expected: {subscriptions: [{args: noCursors, is_canceled: true}]},
    mockTimers: true,
    steps: [{data: streamErr, emit: 'error'}, {tick: 29999}],
  },
  {
    args: {},
    description: 'Removing all listeners cancels the subscription',
    expected: {subscriptions: [{args: noCursors, is_canceled: true}]},
    steps: [
      {remove: true},
      // The canceled stream reports an error which should not resubscribe
      {data: cancelErr, emit: 'error'},
      {wait: restartWaitMs},
    ],
  },
  {
    args: {restart_delay_ms: 10},
    description: 'Removing listeners while waiting to resubscribe ends',
    expected: {subscriptions: [{args: noCursors, is_canceled: true}]},
    steps: [{data: streamErr, emit: 'error'}, {remove: true}, {wait: 40}],
  },
  {
    args: {restart_delay_ms: 10},
    description: 'Removing the invoice listener while waiting to restart ends',
    expected: {
      errors: [],
      events: ['end'],
      subscriptions: [{args: noCursors, is_canceled: true}],
    },
    steps: [
      {data: streamErr, emit: 'error'},
      {remove: 'invoice_updated'},
      {wait: 40},
    ],
  },
  {
    args: {},
    description: 'Resubscribing does not accumulate listeners',
    expected: {
      removeListeners: 1,
      subscriptions: Array.from({length: 21}, (_, i) => ({
        args: noCursors,
        is_canceled: i < 20 ? true : undefined,
      })),
    },
    steps: Array.from({length: 20}, () => [
      {data: streamErr, emit: 'error'},
      {wait: 5},
    ]).flat(),
  },
  {
    args: {},
    description: 'Failing to start a subscription emits an error and ends',
    expected: {
      errors: [[503, 'FailedToSubscribeToInvoices', {err: startErr}]],
      events: ['error', 'end'],
      subscriptions: [],
    },
    lnd: {err: startErr},
    steps: [{wait: 1}],
  },
  {
    args: {},
    description: 'Resume cursors are looked up before subscribing',
    expected: {
      lookups: 1,
      subscriptions: [
        {args: {add_index: '5', settle_index: '3'}, is_canceled: true},
        {args: {add_index: '5', settle_index: '3'}, is_canceled: undefined},
      ],
    },
    lnd: {listInvoices: [newestInvoices]},
    steps: failAndResubscribe,
  },
  {
    args: {added_after: 2},
    description: 'Given and received cursors beat looked up cursors',
    expected: {
      subscriptions: [
        {args: {add_index: '2', settle_index: '3'}, is_canceled: true},
        {args: {add_index: '2', settle_index: '9'}, is_canceled: undefined},
      ],
    },
    lnd: {listInvoices: [newestInvoices]},
    steps: [
      {data: rpcInvoice({add: 1, settle: 9}), emit: 'data'},
      ...failAndResubscribe,
    ],
  },
  {
    args: {},
    description: 'Removing listeners during the lookup does not subscribe',
    expected: {lookups: 1, subscriptions: []},
    lnd: {listInvoices: []},
    steps: [
      {remove: true},
      // The lookup finishes after the subscription was stopped
      {res: newestInvoices, resolve: 0},
      {wait: restartWaitMs},
    ],
  },
  {
    args: {},
    description: 'A failed resume cursor lookup is tried again',
    expected: {
      // Neither lookup errors nor retried stream failures are emitted
      errors: [],
      lookups: 2,
      subscriptions: [
        {args: noCursors, is_canceled: true},
        {args: {add_index: '5', settle_index: '3'}, is_canceled: true},
        {args: {add_index: '5', settle_index: '3'}, is_canceled: undefined},
      ],
    },
    lnd: {listInvoices: [{err: 'err'}, newestInvoices]},
    steps: [...failAndResubscribe, ...failAndResubscribe],
  },
  {
    args: {added_after: 1, confirmed_after: 1},
    description: 'Resume cursors are not looked up when provided',
    expected: {lookups: 0},
    lnd: {listInvoices: []},
  },
  {
    args: {},
    description: 'An AMP settlement moves the settle cursor and emits once',
    expected: {
      subscriptions: [
        {args: noCursors, is_canceled: true},
        {args: {add_index: '5', settle_index: '7'}, is_canceled: undefined},
      ],
      updates: [{confirmed_index: 7, index: 5}],
    },
    steps: [
      {data: rpcInvoice({add: 5, amp: 7}), emit: 'data'},
      ...failAndResubscribe,
      // LND replays the settled set after the restart
      {data: rpcInvoice({add: 5, amp: 7}), emit: 'data'},
    ],
  },
  {
    args: {},
    description: 'A repeated settlement is only emitted once',
    expected: {updates: [settled(4), settled(3)]},
    // LND catch up can send a settled invoice as added and as settled
    steps: [settle(4), settle(3), settle(4)],
  },
  {
    args: {},
    description: 'Remembered settlements are limited',
    expected: {
      // The oldest settlement is forgotten, the newest is still remembered
      updates: [
        ...Array.from({length: 10001}, (_, i) => settled(i + 1)),
        settled(1),
      ],
    },
    steps: [
      ...Array.from({length: 10001}, (_, i) => settle(i + 1)),
      settle(1),
      settle(10001),
    ],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToInvoices(args), new Error(error), 'Got error');
    } else {
      const got = await observeSubscription({args, ...scenario});

      Object.keys(expected).forEach(key => {
        return deepStrictEqual(got[key], expected[key], `Got expected ${key}`);
      });
    }

    return;
  });
});
