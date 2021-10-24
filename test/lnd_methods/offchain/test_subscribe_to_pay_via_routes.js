const {test} = require('@alexbosworth/tap');

const {subscribeToPayViaRoutes} = require('./../../../');

const deletePayment = ({}, cbk) => cbk();

const route = {
  fee: 1,
  fee_mtokens: '1000',
  hops: [{
    channel: '0x0x1',
    channel_capacity: 1,
    fee_mtokens: '1',
    forward_mtokens: '1',
    public_key: 'public_key',
  }],
  tokens: 1,
};

const tests = [
  {
    args: {id: 'id'},
    description: 'The id of a past payment must be a preimage hash',
    error: 'ExpectedPaymentHashToPayViaRoutes',
  },
  {
    args: {},
    description: 'LND is expected',
    error: 'ExpectedAuthenticatedLndToPayViaRoutes',
  },
  {
    args: {
      lnd: {default: {deletePayment}, router: {sendToRouteV2: ({}) => {}}},
    },
    description: 'Routes are required',
    error: 'ExpectedArrayOfPaymentRoutesToPayViaRoutes',
  },
  {
    args: {
      lnd: {default: {deletePayment}, router: {sendToRouteV2: ({}) => {}}},
      routes: [],
    },
    description: 'Non empty routes are required',
    error: 'ExpectedArrayOfPaymentRoutesToPayViaRoutes',
  },
  {
    args: {
      lnd: {default: {deletePayment}, router: {sendToRouteV2: ({}) => {}}},
      routes: [{}],
    },
    description: 'Route must have hops',
    error: 'ExpectedRouteHopsToPayViaRoutes',
  },
  {
    args: {
      lnd: {default: {deletePayment}, router: {sendToRouteV2: ({}) => {}}},
      routes: [{hops: [{}]}],
    },
    description: 'Hops must have public keys',
    error: 'ExpectedPublicKeyInPayViaRouteHops',
  },
  {
    args: {
      lnd: {default: {deletePayment}, router: {sendToRouteV2: ({}) => {}}},
      routes: [{hops: [{public_key: 'public_key'}]}],
    },
    description: 'Hops must have channel ids',
    error: 'ExpectedValidRouteChannelIdsForPayViaRoutes',
  },
  {
    args: {
      lnd: {default: {deletePayment}, router: {sendToRouteV2: ({}) => {}}},
      routes: [{hops: [{public_key: 'public_key'}]}],
    },
    description: 'Hops must have channel ids',
    error: 'ExpectedValidRouteChannelIdsForPayViaRoutes',
  },
  {
    args: {
      lnd: {
        default: {deletePayment},
        router: {
          sendToRouteV2: ({}, cbk) => cbk({details: 'unknown wire error'}),
        },
      },
      routes: [route],
    },
    description: 'There is no result on unknown wire errors',
    expected: {attempts: [{route}], failures: []},
  },
  {
    args: {
      lnd: {
        default: {deletePayment},
        router: {
          sendToRouteV2: ({}, cbk) => cbk({
            details: 'payment attempt not completed before timeout',
          }),
        },
      },
      routes: [route],
    },
    description: 'There is no result on a timeout error',
    expected: {attempts: [{route}], failures: []},
  },
  {
    args: {
      lnd: {
        default: {deletePayment},
        router: {sendToRouteV2: ({}, cbk) => cbk('err')},
      },
      routes: [route],
    },
    description: 'An unexpected payment error is passed back',
    expected: {
      attempts: [{route}],
      error: [503, 'UnexpectedErrorWhenPayingViaRoute', {err: 'err'}],
      failures: [],
    },
  },
  {
    args: {
      lnd: {
        default: {deletePayment},
        router: {sendToRouteV2: ({}, cbk) => cbk()},
      },
      routes: [route],
    },
    description: 'A result is expected from sendToRoute',
    expected: {
      attempts: [{route}],
      error: [503, 'ExpectedResponseFromLndWhenPayingViaRoute'],
      failures: [],
    },
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        default: {deletePayment},
        router: {
          sendToRouteV2: ({}, cbk) => cbk(null, {
            preimage: Buffer.alloc(32),
          }),
        },
      },
      routes: [route, route],
    },
    description: 'A success is returned',
    expected: {
      attempts: [{route}],
      failures: [],
      success: {
        route,
        confirmed_at: undefined,
        fee: route.fee,
        fee_mtokens: route.fee_mtokens,
        hops: route.hops,
        id: Buffer.alloc(32).toString('hex'),
        mtokens: route.mtokens,
        safe_fee: undefined,
        safe_tokens: undefined,
        secret: Buffer.alloc(32).toString('hex'),
        tokens: route.tokens,
      },
    },
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        default: {deletePayment},
        router: {
          sendToRouteV2: ({}, cbk) => cbk(null, {
            preimage: 'preimage',
          }),
        },
      },
      routes: [route],
    },
    description: 'A success is returned',
    expected: {
      attempts: [{route}],
      error: [503, 'UnexpectedResultWhenPayingViaSendToRouteSync'],
      failures: [],
    },
  },
  {
    args: {
      lnd: {
        default: {deletePayment},
        router: {
          sendToRouteV2: ({}, cbk) => cbk(null, {
            failure: {
              chan_id: '1',
              code: 'UNKNOWN_FAILURE',
            },
            preimage: Buffer.alloc(Number()),
          }),
        },
      },
      routes: [route],
    },
    description: 'A routing failure is returned',
    expected: {
      attempts: [{route}],
      failures: [{
        route,
        channel: undefined,
        height: undefined,
        index: undefined,
        mtokens: undefined,
        policy: null,
        public_key: undefined,
        reason: 'UnknownFailure',
        timeout_height: undefined,
        update: undefined,
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {deletePayment},
        router: {
          sendToRouteV2: ({}, cbk) => cbk(null, {
            failure: {
              chan_id: '1',
              code: 'UNKNOWN_FAILURE',
              failure_source_index: 2,
            },
            preimage: Buffer.alloc(Number()),
          }),
        },
      },
      routes: [
        {
          fee: 1,
          fee_mtokens: '1000',
          hops: [
            {
              channel: '0x0x1',
              channel_capacity: 1,
              fee_mtokens: '1',
              forward_mtokens: '1',
              public_key: 'public_key',
            },
            {
              channel: '0x0x1',
              channel_capacity: 1,
              fee_mtokens: '1',
              forward_mtokens: '1',
              public_key: 'public_key',
            },
          ],
          tokens: 1,
        },
        route,
      ],
    },
    description: 'A routing failure that reaches the destination stops routes',
    expected: {
      attempts: [{
        route: {
          fee: 1,
          fee_mtokens: '1000',
          hops: [
            {
              channel: '0x0x1',
              channel_capacity: 1,
              fee_mtokens: '1',
              forward_mtokens: '1',
              public_key: 'public_key',
            },
            {
              channel: '0x0x1',
              channel_capacity: 1,
              fee_mtokens: '1',
              forward_mtokens: '1',
              public_key: 'public_key',
            },
          ],
          tokens: 1,
        },
      }],
      failures: [
        {
          channel: undefined,
          height: undefined,
          index: 2,
          mtokens: undefined,
          policy: null,
          public_key: undefined,
          reason: 'UnknownFailure',
          route: {
            fee: 1,
            fee_mtokens: '1000',
            hops: [
              {
                channel: '0x0x1',
                channel_capacity: 1,
                fee_mtokens: '1',
                forward_mtokens: '1',
                public_key: 'public_key',
              },
              {
                channel: '0x0x1',
                channel_capacity: 1,
                fee_mtokens: '1',
                forward_mtokens: '1',
                public_key: 'public_key',
              },
            ],
            tokens: 1,
          },
          timeout_height: undefined,
          update: undefined,
        },
      ],
    },
  },
  {
    args: {
      lnd: {
        default: {deletePayment},
        router: {
          sendToRouteV2: ({}, cbk) => cbk(null, {
            failure: {
              chan_id: '1',
              code: 'UNKNOWN_FAILURE',
              failure_source_index: 1,
            },
            preimage: Buffer.alloc(Number()),
          }),
        },
      },
      routes: [route],
    },
    description: 'A routing failure is returned from the destination',
    expected: {
      attempts: [{route}],
      failures: [{
        route,
        channel: undefined,
        height: undefined,
        index: 1,
        mtokens: undefined,
        policy: null,
        public_key: undefined,
        reason: 'UnknownFailure',
        timeout_height: undefined,
        update: undefined,
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {deletePayment},
        router: {
          sendToRouteV2: ({}, cbk) => {
            return setTimeout(() => cbk({details: 'unknown wire error'}), 100);
          },
        },
      },
      pathfinding_timeout: 99,
      routes: [route, route],
    },
    description: 'Pathfinding attempt times out the payment',
    expected: {
      attempts: [{route}],
      error: [503, 'PathfindingTimeoutExceeded'],
      failures: [],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToPayViaRoutes(args), new Error(error), 'Got err');

      return end();
    } else {
      const attempts = [];
      const failures = [];
      let gotError;
      let gotSuccess;
      const sub = subscribeToPayViaRoutes(args);

      sub.on('error', err => gotError = err);
      sub.on('paying', attempt => attempts.push(attempt));
      sub.on('routing_failure', failure => failures.push(failure));
      sub.on('success', success => gotSuccess = success);

      return sub.once('end', () => {
        strictSame(attempts, expected.attempts, 'Got expected pay attempts');
        strictSame(failures, expected.failures, 'Got expected pay failures');
        strictSame(gotSuccess, expected.success, 'Got expected pay success');

        const [errCode, errMessage] = gotError || [];
        const [expectedErrCode, expectedErrMessage] = expected.error || [];

        equal(errCode, expectedErrCode, 'Got expected error code');
        equal(errMessage, expectedErrMessage, 'Got expected error message');

        return end();
      });
    }

    return end();
  });
});
