const {test} = require('@alexbosworth/tap');

const method = require('./../../../lnd_methods/offchain/finished_payment');

const makeArgs = overrides => {
  const args = {
    confirmed: {
      confirmed_at: new Date(1).toISOString(),
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward_mtokens: '1000',
        public_key: Buffer.alloc(33).toString('hex'),
        timeout: 1,
      }],
      id: Buffer.alloc(32).toString('hex'),
      mtokens: '1000',
      paths: [{
        fee_mtokens: '1000',
        hops: [{
          channel: '0x0x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward_mtokens: '1000',
          public_key: Buffer.alloc(33).toString('hex'),
          timeout: 1,
        }],
        mtokens: '1000',
      }],
      safe_fee: 1,
      safe_tokens: 1,
      secret: Buffer.alloc(32).toString('hex'),
      timeout: 1,
      tokens: 1,
    },
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({confirmed: undefined}),
    description: 'Either failed or confirmed is required',
    error: [503, 'UnexpectedOutcomeOfPayViaDetails'],
  },
  {
    args: makeArgs({
      confirmed: undefined,
      failed: {is_insufficient_balance: true},
    }),
    description: 'Failed due to insufficient balance',
    error: [503, 'InsufficientBalanceToAttemptPayment'],
  },
  {
    args: makeArgs({
      confirmed: undefined,
      failed: {is_invalid_payment: true},
    }),
    description: 'Failed due to invalid payment hash',
    error: [503, 'PaymentRejectedByDestination'],
  },
  {
    args: makeArgs({
      confirmed: undefined,
      failed: {is_route_not_found: true},
    }),
    description: 'Failed due to route not found',
    error: [503, 'PaymentPathfindingFailedToFindPossibleRoute'],
  },
  {
    args: makeArgs({
      confirmed: undefined,
      failed: {is_pathfinding_timeout: true},
    }),
    description: 'Failed due to pathfinding timing out',
    error: [503, 'PaymentAttemptsTimedOut'],
  },
  {
    args: makeArgs({confirmed: undefined, failed: {}}),
    description: 'Failed due to other reason',
    error: [503, 'FailedToFindPayableRouteToDestination'],
  },
  {
    args: makeArgs({}),
    description: 'Successful payment details are returned',
    expected: {
      confirmed_at: '1970-01-01T00:00:00.001Z',
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward_mtokens: '1000',
        public_key: '000000000000000000000000000000000000000000000000000000000000000000',
        timeout: 1,
      }],
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      mtokens: '1000',
      paths: [{
        fee_mtokens: '1000',
        hops: [{
          channel: '0x0x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward_mtokens: '1000',
          public_key: '000000000000000000000000000000000000000000000000000000000000000000',
          timeout: 1
        }],
        mtokens: '1000'
      }],
      secret: '0000000000000000000000000000000000000000000000000000000000000000',
      safe_fee: 1,
      safe_tokens: 1,
      timeout: 1,
      tokens: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects, strictSame}) => {
    if (!!error) {
      await rejects(method(args), error, 'Got expected error');
    } else {
      strictSame(await method(args), expected, 'Got expected result');
    }

    return end();
  });
});
