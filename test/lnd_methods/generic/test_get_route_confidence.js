const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('events');
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getInfoResponse} = require('./../fixtures');
const {getRouteConfidence} = require('./../../../');

const makeLnd = ({err, res}) => {
  return {
    default: {
      getInfo: ({}, cbk) => cbk(err, getInfoResponse),
    },
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
    wallet: {
      deriveKey: ({}, cbk) => cbk('err'),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'Hops are required',
    error: [400, 'ExpectedArrayOfHopsToCalculateRoutingOdds'],
  },
  {
    args: {hops: [{}]},
    description: 'Valid hops are required',
    error: [400, 'ExpectedHopsWithEdges'],
  },
  {
    args: {
      from: Buffer.alloc(33, 1).toString('hex'),
      hops: [{
        forward_mtokens: '1',
        public_key: Buffer.alloc(33, 2).toString('hex'),
      }],
      lnd: {
        default: {
          getInfo: ({}, cbk) => cbk(null, getInfoResponse),
        },
        router: {
          queryMissionControl: ({}, cbk) => {
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
          queryProbability: ({}, cbk) => cbk('err'),
        },
        wallet: {
          deriveKey: ({}, cbk) => cbk('err'),
        },
      },
    },
    description: 'Get route confidence when confidence query returns err',
    error: [503, 'UnexpectedErrorFromQueryProbability', {err: 'err'}],
  },
  {
    args: {
      from: Buffer.alloc(33, 1).toString('hex'),
      hops: [{
        forward_mtokens: '1',
        public_key: Buffer.alloc(33, 2).toString('hex'),
      }],
      lnd: makeLnd({}),
    },
    description: 'Get route confidence from non self',
    expected: {confidence: 950000},
  },
  {
    args: {
      hops: [{
        forward_mtokens: '1',
        public_key: Buffer.alloc(33, 2).toString('hex'),
      }],
      lnd: makeLnd({}),
    },
    description: 'Get route confidence',
    expected: {confidence: 950000},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(getRouteConfidence(args), error, 'Got expected error');
    } else {
      const got = await getRouteConfidence(args);

      deepStrictEqual(got, expected, 'Got expected result');
    }

    return;
  });
});
