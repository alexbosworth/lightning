const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {subscribeToPayments} = require('./../../../');

const tick = () => new Promise(resolve => process.nextTick(resolve));

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: 'ExpectedAuthenticatedLndToSubscribeToCurrentPayments',
  },
  {
    args: {
      lnd: {
        router: {
          trackPayments: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', 'error'));

            return emitter;
          },
        },
      },
    },
    description: 'An error is emitted',
    expected: {
      confirmed: [],
      errors: [[503, 'UnexpectedPaymentsSubErr', {err: 'error'}]],
    },
  },
  {
    args: {
      lnd: {
        router: {
          trackPayments: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('data', {
              creation_date: '1',
              creation_time_ns: '1',
              failure_reason: 'FAILURE_REASON_NONE',
              fee: '1',
              fee_msat: '1000',
              fee_sat: '1',
              htlcs: [{
                attempt_time_ns: '1',
                status: 'SUCCEEDED',
                resolve_time_ns: '1',
                route: {
                  hops: [{
                    amt_to_forward: '1',
                    amt_to_forward_msat: '1000',
                    chan_capacity: '1',
                    chan_id: '1',
                    custom_records: {'1': Buffer.alloc(1)},
                    expiry: 1,
                    fee: '1',
                    fee_msat: '1000',
                    mpp_record: {payment_addr: Buffer.alloc(32), total_amt_msat: '1000'},
                    pub_key: Buffer.alloc(33).toString('hex'),
                    tlv_payload: true,
                  }],
                  total_amt: '1',
                  total_amt_msat: '1000',
                  total_time_lock: 1,
                  total_fees: '1',
                  total_fees_msat: '1000',
                },
              }],
              path: [Buffer.alloc(33).toString('hex')],
              payment_hash: Buffer.alloc(32).toString('hex'),
              payment_index: '1',
              payment_preimage: Buffer.alloc(32).toString('hex'),
              payment_request: '',
              status: 'SUCCEEDED',
              value: '1',
              value_msat: '1000',
              value_sat: '1',
            }));

            return emitter;
          },
        },
      },
    },
    description: 'A payment is made',
    expected: {
      confirmed: [{
        confirmed_at: '1970-01-01T00:00:00.000Z',
        created_at: '1970-01-01T00:00:00.000Z',
        destination: Buffer.alloc(33).toString('hex'),
        fee: 1,
        fee_mtokens: '1000',
        hops: [{
          channel: '0x0x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: Buffer.alloc(33).toString('hex'),
          timeout: 1,
        }],
        id: Buffer.alloc(32).toString('hex'),
        mtokens: '2000',
        paths: [{
          fee: 1,
          fee_mtokens: '1000',
          hops: [{
            channel: '0x0x1',
            channel_capacity: 1,
            fee: 1,
            fee_mtokens: '1000',
            forward: 1,
            forward_mtokens: '1000',
            public_key: Buffer.alloc(33).toString('hex'),
            timeout: 1,
          }],
          mtokens: '1000',
          payment: '0000000000000000000000000000000000000000000000000000000000000000',
          timeout: 1,
          tokens: 1,
          total_mtokens: '1000',
        }],
        request: undefined,
        safe_fee: 1,
        safe_tokens: 2,
        secret: Buffer.alloc(32).toString('hex'),
        timeout: 1,
        tokens: 2,
      }],
      errors: [],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToPayments(args), new Error(error), 'Got err');
    } else {
      const sub = subscribeToPayments(args);

      const confirmed = [];
      const errors = [];

      sub.on('confirmed', payment => confirmed.push(payment));
      sub.on('error', err => errors.push(err));

      await tick();
      await tick();

      strictSame(confirmed, expected.confirmed, 'Got expected payments');
      strictSame(errors, expected.errors, 'Got expected errors');
    }

    return end();
  });
});
