const {test} = require('@alexbosworth/tap');

const {getForwardingConfidence} = require('./../../../');

const makeLnd = ({err, res}) => {
  return {
    router: {
      queryProbability: ({}, cbk) => {
        if (!!err) {
          return cbk(err);
        }

        if (res !== undefined) {
          return cbk(null, res);
        }

        return cbk(null, {history: {}, probability: 0.5});
      },
    },
  };
};

const makeArgs = overrides => {
  const args = {
    from: Buffer.alloc(33, 3).toString('hex'),
    lnd: makeLnd({}),
    mtokens: '1',
    to: Buffer.alloc(33, 2).toString('hex'),
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({from: undefined}),
    description: 'A from source is expected',
    error: [400, 'ExpectedFromPublicKeyToGetRoutingConfidence'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is expected',
    error: [400, 'ExpectedAuthenticatedLndToGetRoutingConfidence'],
  },
  {
    args: makeArgs({mtokens: undefined}),
    description: 'Millitokens are expected',
    error: [400, 'ExpectedMillitokensToGetRoutingConfidence'],
  },
  {
    args: makeArgs({to: undefined}),
    description: 'A to destination is expected',
    error: [400, 'ExpectedToPublicKeyToGetRoutingConfidence'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service routerrpc.Router'}}),
    }),
    description: 'An unknown API error is returned',
    error: [501, 'QueryProbabilityNotImplemented'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'An unknown service error is returned',
    error: [503, 'UnexpectedErrorFromQueryProbability', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({res: null})}),
    description: 'A response is expected',
    error: [503, 'ExpectedResponseFromQueryProbability'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {}})}),
    description: 'A history pair is expected',
    error: [503, 'ExpectedHistoryFromQueryProbability'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {history: {}}})}),
    description: 'A probability is expected',
    error: [503, 'ExpectedProbabilityInQueryProbabilityResult'],
  },
  {
    args: makeArgs({}),
    description: 'Forwarding confidence is returned',
    expected: {confidence: 500000},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(getForwardingConfidence(args), error, 'Got expected err');
    } else {
      const res = await getForwardingConfidence(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
