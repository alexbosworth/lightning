const {test} = require('@alexbosworth/tap');

const {cancelPendingChannel} = require('./../../../lnd_methods');

const id = Buffer.alloc(32).toString('hex');

const tests = [
  {
    args: {},
    description: 'A pending channel id is required to cancel pending channel',
    error: [400, 'ExpectedPendingChannelIdToCancelPendingChannel'],
  },
  {
    args: {id},
    description: 'LND Object is required to cancel pending channel',
    error: [400, 'ExpectedAuthenticatedLndToCancelPendingChannel'],
  },
  {
    args: {id, lnd: {default: {fundingStateStep: ({}, cbk) => cbk('err')}}},
    description: 'Funding state step error is returned',
    error: [503, 'UnexpectedErrorCancelingPendingChannel', {err: 'err'}],
  },
  {
    args: {id, lnd: {default: {fundingStateStep: ({}, cbk) => cbk()}}},
    description: 'Funding state step is executed',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      rejects(() => cancelPendingChannel(args), error, 'Got expected error');
    } else {
      await cancelPendingChannel(args);
    }

    return end();
  });
});
