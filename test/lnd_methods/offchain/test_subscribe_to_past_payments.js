const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {subscribeToPastPayments} = require('./../../../lnd_methods');

const nextTick = () => new Promise(cbk => process.nextTick(() => cbk()));

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: 'ExpectedAuthenticatedLndToSubscribeToPayments',
  },
  {
    args: {
      lnd: {
        router: {
          subscribeHtlcEvents: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', {
            }));

            return emitter;
          },
          trackPaymentV2: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('data', {
            }));

            process.nextTick(() => emitter.emit('end'));

            return emitter;
          },
        },
      },
    },
    description: 'Errors are emitted',
  },
  {
    args: {
      lnd: {
        router: {
          subscribeHtlcEvents: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('data', {
            }));

            return emitter;
          },
          trackPaymentV2: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('data', {
            }));

            process.nextTick(() => emitter.emit('end'));

            return emitter;
          },
        },
      },
    },
    description: 'HTLCs should be well formed',
  },
  {
    args: {
      lnd: {
        router: {
          subscribeHtlcEvents: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('data', {
              event_type: 'SEND',
              forward_event: undefined,
              incoming_channel_id: '1',
              incoming_htlc_id: '0',
              outgoing_channel_id: '2',
              outgoing_htlc_id: '1',
              settle_event: {preimage: Buffer.alloc(32, 1)},
              timestamp_ns: 1e8,
            }));

            return emitter;
          },
          trackPaymentV2: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('data', {
            }));

            process.nextTick(() => emitter.emit('end'));

            return emitter;
          },
        },
      },
    },
    description: 'Only real past payments are emitted',
  },
  {
    args: {
      lnd: {
        router: {
          subscribeHtlcEvents: () => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('data', {
              event_type: 'SEND',
              forward_event: undefined,
              incoming_channel_id: '1',
              incoming_htlc_id: '0',
              outgoing_channel_id: '2',
              outgoing_htlc_id: '1',
              settle_event: {preimage: Buffer.alloc(0)},
              timestamp_ns: 1e8,
            }));

            process.nextTick(() => emitter.emit('data', {
              event_type: 'SEND',
              forward_event: undefined,
              incoming_channel_id: '1',
              incoming_htlc_id: '0',
              outgoing_channel_id: '2',
              outgoing_htlc_id: '1',
              settle_event: {preimage: Buffer.alloc(32, 1)},
              timestamp_ns: 1e8,
            }));

            return emitter;
          },
          trackPaymentV2: () => {
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

            process.nextTick(() => emitter.emit('end'));

            return emitter;
          },
        },
      },
    },
    description: 'A past payment is emitted',
    expected: {
      confirmed_at: '1970-01-01T00:00:00.000Z',
      created_at: '1970-01-01T00:00:00.000Z',
      destination: '000000000000000000000000000000000000000000000000000000000000000000',
      fee: 1,
      fee_mtokens: '1000',
      hops: [
        {
          channel: '0x0x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: '000000000000000000000000000000000000000000000000000000000000000000',
          timeout: 1,
        }
      ],
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      mtokens: '2000',
      paths: [
        {
          fee: 1,
          fee_mtokens: '1000',
          hops: [
            {
              channel: '0x0x1',
              channel_capacity: 1,
              fee: 1,
              fee_mtokens: '1000',
              forward: 1,
              forward_mtokens: '1000',
              public_key: '000000000000000000000000000000000000000000000000000000000000000000',
              timeout: 1,
            }
          ],
          mtokens: '1000',
          payment: '0000000000000000000000000000000000000000000000000000000000000000',
          timeout: 1,
          tokens: 1,
          total_mtokens: '1000',
        }
      ],
      request: undefined,
      safe_fee: 1,
      safe_tokens: 2,
      secret: '0000000000000000000000000000000000000000000000000000000000000000',
      timeout: 1,
      tokens: 2,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToPastPayments(args), new Error(error), 'Got err');
    } else {
      const payments = [];
      const sub = subscribeToPastPayments(args);

      sub.on('payment', payment => payments.push(payment));

      await nextTick();

      const [payment] = payments;

      strictSame(payment, expected, 'Got expected payment');
    }

    return end();
  });
});
