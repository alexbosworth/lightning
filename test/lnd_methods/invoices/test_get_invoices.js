const {test} = require('@alexbosworth/tap');

const {getInvoices} = require('./../../../');
const {lookupInvoiceResponse} = require('./../fixtures');

const id = Buffer.alloc(32).toString('hex');

const tests = [
  {
    args: {limit: 'limit', token: 'token'},
    description: 'A limit and a paging token should not be passed together',
    error: [400, 'UnexpectedLimitWhenPagingInvoicesWithToken'],
  },
  {
    args: {},
    description: 'Authenticated LND is required',
    error: [400, 'ExpectedLndForInvoiceListing'],
  },
  {
    args: {
      lnd: {default: {listInvoices: ({}, cbk) => cbk('err')}},
      token: JSON.stringify({limit: 100, offset: 2}),
    },
    description: 'Errors are passed back',
    error: [503, 'UnexpectedGetInvoicesError', {err: 'err'}],
  },
  {
    args: {lnd: {default: {listInvoices: ({}, cbk) => cbk()}}},
    description: 'A response is expected',
    error: [503, 'ExpectedResponseForListInvoicesRequest'],
  },
  {
    args: {lnd: {default: {listInvoices: ({}, cbk) => cbk(null, {})}}},
    description: 'Invoices are expected',
    error: [503, 'ExpectedInvoicesListForInvoicesQuery'],
  },
  {
    args: {lnd: {default: {listInvoices: ({}, cbk) => cbk(null, {
      invoices: [],
    })}}},
    description: 'First index offset is expected',
    error: [503, 'ExpectedFirstIndexOffsetForInvoicesQuery'],
  },
  {
    args: {lnd: {default: {listInvoices: ({}, cbk) => cbk(null, {
      first_index_offset: '1',
      invoices: [],
    })}}},
    description: 'Last index offset is expected',
    error: [503, 'ExpectedLastIndexOffsetForInvoicesQuery'],
  },
  {
    args: {lnd: {default: {listInvoices: ({}, cbk) => cbk(null, {
      first_index_offset: '1',
      invoices: [{}],
      last_index_offset: '1',
    })}}},
    description: 'Valid invoices are required',
    error: [503, 'ExpectedInvoiceCreationDateInResponse'],
  },
  {
    args: {
      lnd: {
        default: {
          listInvoices: ({}, cbk) => cbk(null, {
            first_index_offset: '1',
            invoices: [],
            last_index_offset: '1',
          }),
        },
      },
      token: 'token',
    },
    description: 'Valid token is required',
    error: [400, 'ExpectedValidPagingTokenForInvoicesReq'],
  },
  {
    args: {
      lnd: {
        default: {
          listInvoices: ({}, cbk) => cbk(null, {
            first_index_offset: '2',
            invoices: [lookupInvoiceResponse({})],
            last_index_offset: '2',
          }),
        },
      },
    },
    description: 'Invoices are returned',
    expected: {
      invoices: [{
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
        tokens: 1,
      }],
      next: '{"offset":2,"limit":100}',
    },
  },
  {
    args: {
      lnd: {
        default: {
          listInvoices: ({}, cbk) => cbk(null, {
            first_index_offset: '2',
            invoices: [],
            last_index_offset: '2',
          }),
        },
      },
    },
    description: 'Empty invoices are returned',
    expected: {invoices: [], next: undefined},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(getInvoices(args), error, 'Got expected err');
    } else {
      const res = await getInvoices(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
