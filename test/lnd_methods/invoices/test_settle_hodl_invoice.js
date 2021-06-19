const {test} = require('@alexbosworth/tap');

const {settleHodlInvoice} = require('./../../../');

const secret = Buffer.alloc(32).toString('hex');

const makeLnd = ({err}) => {
  return {invoices: {settleInvoice: ({}, cbk) => cbk(err)}};
};

const tests = [
  {
    args: {},
    description: 'LND is required to settle invoice',
    error: [400, 'ExpectedInvoicesLndToSettleHodlInvoice'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'A secret is required to settle invoice',
    error: [400, 'ExpectedPaymentPreimageToSettleHodlInvoice'],
  },
  {
    args: {lnd: makeLnd({}), secret: 'secret'},
    description: 'A hex secret is required to settle an invoice',
    error: [400, 'ExpectedPaymentPreimageToSettleHodlInvoice'],
  },
  {
    args: {lnd: makeLnd({}), secret: '00'},
    description: 'The preimage must be a preimage length',
    error: [400, 'ExpectedPaymentPreimageToSettleHodlInvoice'],
  },
  {
    args: {secret, lnd: makeLnd({err: {details: 'invoice still open'}})},
    description: 'Invoice must be held to settle',
    error: [402, 'CannotSettleHtlcBeforeHtlcReceived'],
  },
  {
    args: {secret, lnd: makeLnd({err: {details: 'unable to locate invoice'}})},
    description: 'A valid secret is required to settle',
    error: [404, 'SecretDoesNotMatchAnyExistingHodlInvoice'],
  },
  {
    args: {secret, lnd: makeLnd({err: 'err'})},
    description: 'Errors are passed back',
    error: [503, 'UnexpectedErrorWhenSettlingHodlInvoice', {err: 'err'}],
  },
  {
    args: {secret, lnd: makeLnd({})},
    description: 'Errors are passed back',
  },
];

tests.forEach(({args, description, error}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => settleHodlInvoice(args), error, 'Got error');
    } else {
      await settleHodlInvoice(args);
    }

    return end();
  });
});
