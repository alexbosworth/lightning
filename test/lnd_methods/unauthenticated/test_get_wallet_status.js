const {test} = require('@alexbosworth/tap');

const {getStatusResponse} = require('./../fixtures');
const {getWalletStatus} = require('./../../../');

const makeLnd = ({custom, err, res}) => {
  return {
    status: {
      getState: ({}, cbk) => cbk(err, res),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required to get status',
    error: [400, 'ExpectedUnauthenticatedLndGrpcForGetStatusRequest'],
  },
  {
    args: {lnd: makeLnd({err: {details: 'No connection established'}})},
    description: 'No connection returns error',
    error: [503, 'FailedToConnectToDaemon'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Generic failure returns back the error',
    error: [503, 'GetWalletStatusErr', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'Valid result is expected',
    error: [503, 'ExpectedStateInStateResponse'],
  },
  {
    args: {lnd: makeLnd({res: getStatusResponse})},
    description: 'Info is returned',
    expected: {
      "state": 'RPC_ACTIVE'
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getWalletStatus(args), error, 'Got error');
    } else {
      strictSame(await getWalletStatus(args), expected, 'Got info');
    }

    return end();
  });
});
