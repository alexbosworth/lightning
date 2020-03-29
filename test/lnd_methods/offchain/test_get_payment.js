const EventEmitter = require('events');

const {test} = require('tap');

const {getPayment} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'The id of a past payment is required',
    error: [400, 'ExpectedPaymentHashToLookupPastPaymentStatus'],
  },
  {
    args: {id: Buffer.alloc(32).toString('hex')},
    description: 'LND is required',
    error: [400, 'ExpectedLndGrpcApiObjectToLookupPayment'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        router: {
          trackPayment: ({}) => {
            const emitter = new EventEmitter();

            process.nextTick(() => emitter.emit('error', {
              details: `payment isn't initiated`,
            }));

            return emitter;
          },
        },
      },
    },
    description: 'A payment not found returns an error',
    error: [404, 'SentPaymentNotFound'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        router: {
          trackPayment: ({}) => {
            const emitter = new EventEmitter();

            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
      },
    },
    description: 'Unexpected errors are returned',
    error: [503, 'UnexpectedErrorGettingPaymentStatus', {err: 'err'}],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        router: {
          trackPayment: ({}) => {
            const emitter = new EventEmitter();

            process.nextTick(() => emitter.emit('data', {state: 'IN_FLIGHT'}));

            return emitter;
          },
        },
      },
    },
    description: 'An in-progress payment is returned',
    expected: {
      payment: {
        failed: undefined,
        is_confirmed: false,
        is_failed: false,
        is_pending: true,
        payment: undefined,
      },
    },
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        router: {
          trackPayment: ({}) => {
            const emitter = new EventEmitter();

            const hops = [{
              amt_to_forward_msat: '1',
              chan_capacity: '1',
              chan_id: '1',
              expiry: 1,
              fee_msat: '1',
              pub_key: 'b',
            }];

            process.nextTick(() => emitter.emit('data', {
              preimage: Buffer.alloc(32),
              route: {hops, total_amt_msat: '1', total_fees_msat: '1'},
              state: 'SUCCEEDED',
            }));

            return emitter;
          },
        },
      },
    },
    description: 'An in-progress payment is returned',
    expected: {
      payment: {
        failed: undefined,
        is_confirmed: true,
        is_failed: false,
        is_pending: false,
        payment: {
          fee: 0,
          fee_mtokens: '1',
          hops: [{
            channel: '0x0x1',
            channel_capacity: 1,
            fee: 0,
            fee_mtokens: '1',
            forward: 0,
            forward_mtokens: '1',
            public_key: 'b',
            timeout: 1,
          }],
          id: '66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925',
          mtokens: '1',
          safe_fee: 1,
          safe_tokens: 1,
          secret: Buffer.alloc(32).toString('hex'),
          tokens: 0,
        },
      },
    },
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        router: {
          trackPayment: ({}) => {
            const emitter = new EventEmitter();

            process.nextTick(() => {
              emitter.emit('end', {});
              emitter.emit('data', {});
              emitter.emit('status', {});

              emitter.emit('data', {state: 'FAILED_ERROR'});

              return;
            });

            return emitter;
          },
        },
      },
    },
    description: 'A failed payment is returned',
    expected: {
      payment: {
        failed: {
          is_invalid_payment: false,
          is_pathfinding_timeout: false,
          is_route_not_found: false,
        },
        is_confirmed: false,
        is_failed: true,
        is_pending: false,
        payment: undefined,
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => getPayment(args), error, 'Got expected error');
    } else {
      const payment = await getPayment(args);

      deepEqual(payment, expected.payment, 'Got expected payment');
    }

    return end();
  });
});
