const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {deleteForwardingReputations} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedLndToDeleteForwardingReputations'],
  },
  {
    args: {lnd: {router: {resetMissionControl: ({}, cbk) => cbk('err')}}},
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorResettingMissionControl', {err: 'err'}],
  },
  {
    args: {lnd: {router: {resetMissionControl: ({}, cbk) => cbk()}}},
    description: 'Forwarding reputations are deleted',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(deleteForwardingReputations(args), error, 'Got error');
    } else {
      await deleteForwardingReputations(args);
    }

    return;
  });
});
