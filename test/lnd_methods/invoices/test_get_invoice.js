const {test} = require('@alexbosworth/tap');

const {getInvoice} = require('./../../../');
const {lookupInvoiceResponse} = require('./../fixtures');

const id = Buffer.alloc(32).toString('hex');

const tests = [
  {
    args: {},
    description: 'An id of an invoice to get is required',
    error: [400, 'ExpectedIdToGetInvoiceDetails'],
  },
  {
    args: {id: 'foo'},
    description: 'A hex id of an invoice to get is required',
    error: [400, 'ExpectedIdToGetInvoiceDetails'],
  },
  {
    args: {id},
    description: 'LND is required',
    error: [400, 'ExpectedLndToGetInvoiceDetails'],
  },
  {
    args: {id, lnd: {default: {lookupInvoice: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back',
    error: [503, 'UnexpectedLookupInvoiceErr', {err: 'err'}],
  },
  {
    args: {id, lnd: {default: {lookupInvoice: ({}, cbk) => cbk(null, {})}}},
    description: 'Errors are passed back',
    error: [503, 'ExpectedInvoiceCreationDateInResponse'],
  },
  {
    args: {
      id,
      lnd: {
        default: {
          lookupInvoice: ({}, cbk) => cbk(null, lookupInvoiceResponse({})),
        },
      },
    },
    description: 'Invoice is returned',
    expected: {},
  },
];

tests.forEach(({args, description, error}) => {
  return test(description, async ({deepEqual, end, rejects}) => {
    if (!!error) {
      await rejects(getInvoice(args), error, 'Got expected err');
    } else {
      await getInvoice(args);
    }

    return end();
  });
});
