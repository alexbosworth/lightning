const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = './../../../lnd_methods/invoices/subscription_rejection_error';

const subscriptionRejectionError = require(method);

const deniedError = 'PermissionDeniedToSubscribeToInvoices';
const expiredMessage = 'verification failed: macaroon has expired';
const lockedMessage = 'wallet locked, unlock it to enable full RPC access';
const rejectedError = 'SubscriptionToInvoicesRejected';

const denied = err => ({error: [403, deniedError, {err}]});
const rejected = err => ({error: [503, rejectedError, {err}]});

const tests = [
  {
    args: {},
    description: 'No error is not a rejection',
    expected: {},
  },
  {
    args: {err: {code: 14, details: 'No connection established'}},
    description: 'A connection failure is not a rejection',
    expected: {},
  },
  {
    args: {err: {code: 2, details: lockedMessage}},
    description: 'A locked wallet is not a rejection',
    expected: {},
  },
  {
    args: {err: {code: 2, details: 'permission denied'}},
    description: 'A macaroon without permission is denied access',
    expected: denied({code: 2, details: 'permission denied'}),
  },
  {
    args: {err: {code: 2, details: 'expected 1 macaroon, got 0'}},
    description: 'A missing macaroon is denied access',
    expected: denied({code: 2, details: 'expected 1 macaroon, got 0'}),
  },
  {
    args: {err: {code: 2, details: expiredMessage}},
    description: 'An expired macaroon is denied access',
    expected: denied({code: 2, details: expiredMessage}),
  },
  {
    args: {err: {code: 2, details: 'unmarshal v2: unexpected EOF'}},
    description: 'An unreadable macaroon is denied access',
    expected: denied({code: 2, details: 'unmarshal v2: unexpected EOF'}),
  },
  {
    args: {err: {code: 7, details: 'denied'}},
    description: 'A permission denied status is denied access',
    expected: denied({code: 7, details: 'denied'}),
  },
  {
    args: {err: {code: 16, details: 'unauthenticated'}},
    description: 'An unauthenticated status is denied access',
    expected: denied({code: 16, details: 'unauthenticated'}),
  },
  {
    args: {err: {code: 12, details: 'unknown service lnrpc.Lightning'}},
    description: 'An unimplemented status is a rejection',
    expected: rejected({code: 12, details: 'unknown service lnrpc.Lightning'}),
  },
  {
    args: {err: {code: 3, details: 'invalid argument'}},
    description: 'An invalid argument status is a rejection',
    expected: rejected({code: 3, details: 'invalid argument'}),
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const res = subscriptionRejectionError(args);

    deepStrictEqual(res, expected, 'Got expected rejection');

    return end();
  });
});
