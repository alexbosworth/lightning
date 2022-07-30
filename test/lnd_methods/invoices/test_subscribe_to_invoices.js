const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {lookupInvoiceResponse} = require('./../fixtures');
const {subscribeToInvoices} = require('./../../../');

const emitter = new EventEmitter();

emitter.cancel = () => {};

const makeLnd = ({err}) => ({default: {subscribeInvoices: ({}) => emitter}});

const tests = [
  {
    args: {},
    description: 'LND is expected to subscribe to invoices',
    error: 'ExpectedAuthenticatedLndToSubscribeInvoices',
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Subscribe to invoices returns invoices',
    expected: {
      invoice: {
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
      },
    },
  },
  {
    args: {added_after: 1, confirmed_after: 1, lnd: makeLnd({})},
    description: 'Subscribe to invoices with cursor returns invoices',
    expected: {
      invoice: {
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
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  args.restart_delay_ms = 1;

  return test(description, async ({end, equal, match, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToInvoices(args), new Error(error), 'Got error');
    } else {
      let gotEnd;
      let gotErr;
      let gotErr2 = null;
      let gotErr3;
      let gotInvoice;
      let gotStatus;
      const sub = subscribeToInvoices(args);

      const subscriptionError = [
        503,
        'UnexpectedInvoiceSubscriptionError',
        {err: new Error('error')},
      ];

      sub.on('end', () => gotEnd = true);
      sub.on('error', err => gotErr = err);
      sub.on('invoice_updated', invoice => gotInvoice = invoice);
      sub.on('status', status => gotStatus = status);

      emitter.emit('end', {});
      emitter.emit('error', new Error('error'));
      emitter.emit('status', 'status');

      sub.removeAllListeners('error');

      emitter.emit('error', new Error('error'));
      strictSame(gotErr, subscriptionError, 'Got expected error');
      equal(gotErr2, null, 'Did not get second error');
      equal(gotStatus, 'status', 'Got expected status');

      sub.on('error', err => gotErr3 = err);

      emitter.emit('data', {});

      const invoiceError = 'ExpectedInvoiceCreationDateInResponse';

      strictSame(gotErr3, [503, invoiceError], 'Got invoice update error');

      emitter.emit('data', lookupInvoiceResponse({}));

      strictSame(gotInvoice, expected.invoice, 'Got expected invoice');

      sub.removeAllListeners();
    }

    return end();
  });
});
