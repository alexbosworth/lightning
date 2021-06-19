const {test} = require('@alexbosworth/tap');

const {getForwardingReputations} = require('./../../../');

const makeLnd = ({err, res}) => {
  return {
    router: {
      queryMissionControl: ({}, cbk) => {
        if (!!err) {
          return cbk(err);
        }

        if (res !== undefined) {
          return cbk(null, res);
        }

        return cbk(null, {
          pairs: [{
            history: {
              fail_amt_msat: '1000',
              fail_amt_sat: '1',
              fail_time: '1',
              success_amt_msat: '1000',
              success_amt_sat: '1',
              success_time: '1',
            },
            node_from: Buffer.alloc(33, 3),
            node_to: Buffer.alloc(33, 2),
          }],
        });
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is expected',
    error: [400, 'ExpectedLndToGetForwardingReputations'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Unexpected errors are passed back',
    error: [503, 'UnexpectedErrorGettingReputations', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: null})},
    description: 'A response is expected',
    error: [503, 'ExpectedResponseToGetForwardReputationsQuery'],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'Pairs are expected',
    error: [503, 'ExpectedArrayOfPairsInReputationsResponse'],
  },
  {
    args: {lnd: makeLnd({res: {pairs: [{}]}})},
    description: 'Pairs must have from keys',
    error: [503, 'ExpectedFromNodePublicKeyInReputationsResponse'],
  },
  {
    args: {lnd: makeLnd({res: {pairs: [{node_from: Buffer.alloc(33)}]}})},
    description: 'Pairs must have to keys',
    error: [503, 'ExpectedToNodePublicKeyInReputationsResponse'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Forwarding reputations are returned',
    expected: {
      nodes: [{
        peers: [{
          failed_tokens: 1,
          forwarded_tokens: 1,
          last_failed_forward_at: '1970-01-01T00:00:01.000Z',
          last_forward_at: '1970-01-01T00:00:01.000Z',
          to_public_key: '020202020202020202020202020202020202020202020202020202020202020202',
        }],
        public_key: '030303030303030303030303030303030303030303030303030303030303030303',
      }],
    },
  },
  {
    args: {lnd: makeLnd({res: {
      pairs: [
        {
          history: {
            fail_amt_msat: '1000',
            fail_amt_sat: '1',
            fail_time: '1',
            success_amt_msat: '1000',
            success_amt_sat: '1',
            success_time: '1',
          },
          node_from: Buffer.alloc(33, 3),
          node_to: Buffer.alloc(33, 2),
        },
        {
          history: {
            fail_amt_msat: '0',
            fail_amt_sat: '0',
            fail_time: '0',
            success_amt_msat: '0',
            success_amt_sat: '0',
            success_time: '0',
          },
          node_from: Buffer.alloc(33, 3),
          node_to: Buffer.alloc(33),
        },
      ],
    }})},
    description: 'Forwarding reputations with multiple pairs are returned',
    expected: {
      nodes: [{
        peers: [
          {
            failed_tokens: 1,
            forwarded_tokens: 1,
            last_failed_forward_at: '1970-01-01T00:00:01.000Z',
            last_forward_at: '1970-01-01T00:00:01.000Z',
            to_public_key: '020202020202020202020202020202020202020202020202020202020202020202',
          },
          {
            failed_tokens: undefined,
            forwarded_tokens: undefined,
            last_failed_forward_at: undefined,
            last_forward_at: undefined,
            to_public_key: '000000000000000000000000000000000000000000000000000000000000000000',
          },
        ],
        public_key: '030303030303030303030303030303030303030303030303030303030303030303',
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(getForwardingReputations(args), error, 'Got expected err');
    } else {
      const res = await getForwardingReputations(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
