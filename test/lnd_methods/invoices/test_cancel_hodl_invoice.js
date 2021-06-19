const {test} = require('@alexbosworth/tap');

const {cancelHodlInvoice} = require('./../../../');

const makeLnd = ({err}) => {
  return {invoices: {cancelInvoice: ({}, cbk) => cbk(err)}};
};

const tests = [
  {
    args: {},
    description: 'An id is required to cancel an invoice',
    error: [400, 'ExpectedIdOfInvoiceToCancel'],
  },
  {
    args: {id: 'foo'},
    description: 'A hex id is required to cancel an invoice',
    error: [400, 'ExpectedIdOfInvoiceToCancel'],
  },
  {
    args: {id: '00'},
    description: 'LND is required to cancel an invoice',
    error: [400, 'ExpectedInvoicesLndGrpcApiToCancelHodlInvoice'],
  },
  {
    args: {id: '00', lnd: makeLnd({err: 'err'})},
    description: 'Errors are passed back from LND',
    error: [503, 'UnexpectedErrorCancelingHodlInvoice', {err: 'err'}],
  },
  {
    args: {id: '00', lnd: makeLnd({})},
    description: 'Invoice is canceled',
  },
];

tests.forEach(({args, description, error}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => cancelHodlInvoice(args), error, 'Got error');
    } else {
      await cancelHodlInvoice(args);
    }

    return end();
  });
});
