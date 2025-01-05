const {rejects, deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {getRoutingFeeEstimate} = require('../../../');

const makeLnd = ({err, res}) => {
  const r = {
    routing_fee_msat: '1',
    time_lock_delay: '1',
    failure_reason: 'FAILURE_REASON_NONE',
  };

  return {
    router: {
      estimateRouteFee: ({}, cbk) => cbk(err, res !== undefined ? res : r),
    },
  };
};

const makeArgs = override => {
  const args = {lnd: makeLnd({}), request: 'request'};

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToGetRoutingFeeEstimate'],
  },
  {
    args: makeArgs({request: undefined}),
    description: 'Request is required',
    error: [400, 'ExpectedPaymentRequestToGetRoutingFeeEstimate'],
  },
  {
    args: makeArgs({}),
    description: 'A route fee estimate is returned',
    expected: {fee_mtokens: '1', timeout: 1},
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'An error is not expected',
    error: [503, 'UnexpectedGetRoutingFeeEstimateError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({res: null})}),
    description: 'A result is expected',
    error: [503, 'ExpectedGetRoutingFeeEstimateResponse'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {}})}),
    description: 'A result fee is expected',
    error: [503, 'ExpectedFeeInGetRoutingFeeEstimateResponse'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {routing_fee_msat: '1'}})}),
    description: 'A result timeout is expected',
    error: [503, 'ExpectedTimeoutInGetRouteFeeEstimateResponse'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({res: {routing_fee_msat: '1', time_lock_delay: '1'}}),
    }),
    description: 'A result non failure code is expected',
    error: [404, 'RouteToDestinationNotFound', {failure: undefined}],
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(getRoutingFeeEstimate(args), error, 'Got expected error');
    } else {
      deepStrictEqual(await getRoutingFeeEstimate(args), expected, 'Got res');
    }

    return;
  });
});
