const {rejects, deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const getRoutingFeeEstimate = require('../../../lnd_methods/offchain/get_routing_fee_estimate');

const request = 'lnbcrt500u1pnh3r5dpp57cppte59jvmxnaunh03ecy6wchq8e0zh70n0nzsamaxztqxevcusdqqcqzzsxqyz5vqsp587ua488ttsts8cs97ekt9axdla3jmq4mj2h7xj7g6rw37fu65yqs9qxpqysgql27u5p9m2xv0r0pjykzvcgs88azzfkywzw2xw5q6u86qnwzrut94mks86zxelhltdtn6vnqgd8hay433wwq7uvple709gp7pmwmtzwcqakyevc';

/** Function */
const makeLnd = ({err, res}) => {
  const response = {
    fee: 1050,
    timeout: '3520',
    failure_reason: 'FAILURE_REASON_NONE'
  };
  return {
    router: {
      estimateRouteFee: ({}, cbk) => cbk(err, res !== undefined ? res : response),
    }
  };
};

const makeArgs = override => {
  const args = {request, timeout: 60000, lnd: makeLnd({})};
  Object.keys(override || {}).forEach(key => args[key] = override[key]);
  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndForGetRoutingFeeEstimate'],
  },
  {
    args: makeArgs({request: undefined}),
    description: 'Request is required',
    error: [400, 'ExpectedPaymentRequestStringForGetRoutingFeeEstimate'],
  },
  {
    args: makeArgs({timeout: 86400001}),
    description: 'Timeout must be less than or equal to 86400000 milliseconds',
    error: [400, 'ExpectedTimeoutLessThanOneDayForGetRoutingFeeEstimate'],
  },
  {
    args: makeArgs({timeout: 0}),
    description: 'Timeout must be greater than 0 milliseconds',
    error: [400, 'ExpectedTimeoutGreaterThanZeroForGetRoutingFeeEstimate'],
  },
  {
    args: makeArgs({request, lnd: makeLnd({})}),
    description: 'A route fee number in sats is expected for default timeout 60000 milliseconds',
    expected: {fee: 1.05, timeout: '3520'}
  },
  {
    args: makeArgs({request, timeout: 86400000, lnd: makeLnd({})}),
    description: 'A route fee number in sats is expected for timeout 86400000 milliseconds',
    expected: {fee: 1.05, timeout: '3520'}
  }
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(getRoutingFeeEstimate(args), error, 'Got expected error');
    } else {
      deepStrictEqual(await getRoutingFeeEstimate(args), expected, 'Got result');
    }

    return;
  });
});
