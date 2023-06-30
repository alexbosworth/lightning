const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getStatusResponse} = require('./../fixtures');
const {getWalletStatus} = require('./../../../');

const makeLnd = ({err, res}) => {
  return {status: {getState: ({}, cbk) => cbk(err, res)}};
};

const tests = [
  {
    args: {},
    description: 'LND is required to get status',
    error: [400, 'ExpectedUnauthenticatedLndForGetStatusRequest'],
  },
  {
    args: {lnd: makeLnd({err: {details: 'No connection established'}})},
    description: 'No connection returns error',
    error: [503, 'FailedToConnectToDaemonToGetWalletStatus'],
  },
  {
    args: {lnd: makeLnd({err: {details: 'unknown service lnrpc.State'}})},
    description: 'Not supported returns error',
    error: [501, 'GetWalletStatusMethodUnsupported'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Generic failure returns back the error',
    error: [503, 'UnexpectedGetWalletStatusError', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'Valid result is expected',
    error: [503, 'ExpectedStateInStateResponse'],
  },
  {
    args: {lnd: makeLnd({res: getStatusResponse})},
    description: 'Info is returned',
    expected: {is_active: true},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getWalletStatus(args), error, 'Got error');
    } else {
      deepStrictEqual(await getWalletStatus(args), expected, 'Got info');
    }

    return;
  });
});
