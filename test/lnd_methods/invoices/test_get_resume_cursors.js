const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = './../../../lnd_methods/invoices/get_resume_cursors';

const getResumeCursors = require(method);

// Make a page of invoices with consecutive add indexes
const makePage = ({count, first, settled}) => {
  const invoices = Array.from({length: count}, (_, i) => ({
    add_index: String(first + i),
    settle_index: '0',
  }));

  if (!!settled) {
    invoices[0].settle_index = String(settled);
  }

  return {first_index_offset: String(first), invoices};
};

// Make an LND that returns pages in order and records requests
const makeLnd = ({pages}) => {
  const requests = [];

  const lnd = {
    default: {
      listInvoices: (args, cbk) => {
        requests.push(args);

        const isGenerated = typeof pages === 'function';

        const page = isGenerated ? pages(requests.length) : pages.shift();

        if (!!page && !!page.err) {
          return cbk(page.err);
        }

        return cbk(null, page);
      },
    },
  };

  return {lnd, requests};
};

const tests = [
  {
    args: {pages: [makePage({count: 2, first: 9, settled: 4})]},
    description: 'The newest page gives the add and settle indexes',
    expected: {offsets: [0], res: {add_index: 10, settle_index: 4}},
  },
  {
    args: {
      pages: [
        makePage({count: 100, first: 201}),
        makePage({count: 100, first: 101, settled: 7}),
      ],
    },
    description: 'Pages back until a settled invoice is found',
    expected: {offsets: [0, 201], res: {add_index: 300, settle_index: 7}},
  },
  {
    args: {
      pages: [{
        first_index_offset: '8',
        invoices: [
          {
            add_index: '8',
            amp_invoice_state: {
              '00': {settle_index: '6', state: 'SETTLED'},
              '01': {settle_index: '0', state: 'ACCEPTED'},
            },
            settle_index: '0',
          },
          {add_index: '9', settle_index: '5'},
        ],
      }],
    },
    description: 'AMP set settle indexes are used for the settle cursor',
    expected: {offsets: [0], res: {add_index: 9, settle_index: 6}},
  },
  {
    args: {pages: n => makePage({count: 100, first: 100001 - n * 100})},
    description: 'Paging stops at the page limit',
    expected: {
      offsets: [0].concat(Array.from({length: 99}, (_, i) => 99901 - i * 100)),
      res: {add_index: 100000, settle_index: undefined},
    },
  },
  {
    args: {pages: [makePage({count: 100, first: 1})]},
    description: 'Paging stops at the last page',
    expected: {offsets: [0], res: {add_index: 100, settle_index: undefined}},
  },
  {
    args: {pages: [{first_index_offset: '0', invoices: []}]},
    description: 'No invoices gives no cursors',
    expected: {
      offsets: [0],
      res: {add_index: undefined, settle_index: undefined},
    },
  },
  {
    args: {pages: [{err: 'err'}]},
    description: 'Errors are passed back',
    error: [503, 'UnexpectedErrorGettingResumeCursors', {err: 'err'}],
  },
  {
    args: {pages: [undefined]},
    description: 'A response is expected',
    error: [503, 'ExpectedInvoicesToGetInvoiceResumeCursors'],
  },
  {
    args: {pages: [{first_index_offset: '1'}]},
    description: 'Invoices are expected',
    error: [503, 'ExpectedInvoicesToGetInvoiceResumeCursors'],
  },
  {
    args: {pages: [{invoices: []}]},
    description: 'A first index offset is expected',
    error: [503, 'ExpectedFirstIndexOffsetForInvoiceResumeCursors'],
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    const {lnd, requests} = makeLnd(args);

    return getResumeCursors({lnd}, (err, res) => {
      if (!!error) {
        deepStrictEqual(err, error, 'Got expected error');
      } else {
        deepStrictEqual(err, null, 'No error');
        deepStrictEqual(res, expected.res, 'Got expected cursors');

        deepStrictEqual(
          requests.map(n => n.index_offset),
          expected.offsets,
          'Paged back through invoices'
        );

        requests.forEach(n => {
          deepStrictEqual(n.num_max_invoices, 100, 'Got page size');
          deepStrictEqual(n.reversed, true, 'Got newest first');
        });
      }

      return end();
    });
  });
});
