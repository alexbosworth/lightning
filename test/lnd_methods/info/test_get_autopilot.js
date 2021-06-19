const {test} = require('@alexbosworth/tap');

const {getAutopilot} = require('./../../../');

const tests = [
  {
    args: {lnd: {}},
    description: 'Get autopilot with the wrong lnd',
    expected: {
      error_code: 400,
      error_message: 'ExpectedAutopilotEnabledLndToGetAutopilotStatus',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => cbk(),
          status: ({}, cbk) => cbk(null, {active: false}),
        },
      },
    },
    description: 'Lookup enabled status',
    expected: {is_enabled: false},
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => cbk('err'),
          status: ({}, cbk) => cbk(null, {active: false}),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Result error is passed back',
    expected: {
      error_code: 503,
      error_message: 'UnexpectedErrorGettingNodeScores',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => cbk(),
          status: ({}, cbk) => cbk(null, {active: false}),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Result is expected',
    expected: {
      error_code: 503,
      error_message: 'ExpectedResultForLocalNodeScoresQuery',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => cbk(null, {}),
          status: ({}, cbk) => cbk(null, {active: false}),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Result array is expected',
    expected: {
      error_code: 503,
      error_message: 'ExpectedArrayOfResultsForNodesScoresQuery',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => cbk(null, {results: [null]}),
          status: ({}, cbk) => cbk(null, {active: false}),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Result objects are expected',
    expected: {
      error_code: 503,
      error_message: 'UnexpectedHeuristicResultSetInNodeScores',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => cbk(null, {results: [{}]}),
          status: ({}, cbk) => cbk(null, {active: false}),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Result objects are expected',
    expected: {
      error_code: 503,
      error_message: 'ExpectedHeuristicLabelForNodeScoreSet',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => {
            return cbk(null, {results: [{heuristic: 'externalscore'}]});
          },
          status: ({}, cbk) => cbk({
            message: '12 UNIMPLEMENTED: unknown service autopilotrpc.Autopilot',
          }),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Autopilot built lnd is expected',
    expected: {
      error_code: 400,
      error_message: 'ExpectedLndBuiltWithAutopilotToGetStatus',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => {
            return cbk(null, {results: [{heuristic: 'externalscore'}]});
          },
          status: ({}, cbk) => cbk('err'),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Lookup status error passes back error',
    expected: {
      error_code: 503,
      error_message: 'UnexpectedErrorGettingAutopilotStatus',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => {
            return cbk(null, {results: [{heuristic: 'externalscore'}]});
          },
          status: ({}, cbk) => cbk(),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Lookup status expects status',
    expected: {
      error_code: 503,
      error_message: 'UnexpectedEmptyResultGettingAutopilotStatus',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => {
            return cbk(null, {results: [{heuristic: 'externalscore'}]});
          },
          status: ({}, cbk) => cbk(null, {}),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Lookup status expects status state',
    expected: {
      error_code: 503,
      error_message: 'UnexpectedResponseForAutopilotStatusQuery',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: ({}, cbk) => {
            return cbk(null, {results: [{heuristic: 'externalscore'}]});
          },
          status: ({}, cbk) => cbk(null, {active: true}),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Lookup node scores expects scores',
    expected: {
      error_code: 503,
      error_message: 'ExpectedScoresForNodesInScoreResults',
    },
  },
  {
    args: {
      lnd: {
        autopilot: {
          queryScores: (args, cbk) => {
            return cbk(null, {
              results: [
                {heuristic: 'externalscore', scores: {foo: 0.5}},
                {heuristic: 'preferential', scores: {foo: 1}},
                {heuristic: 'weightedcomb', scores: {foo: 0.75}},
              ],
            });
          },
          status: ({}, cbk) => cbk(null, {active: true}),
        },
      },
      node_scores: ['foo'],
    },
    description: 'Lookup node scores',
    expected: {
      is_enabled: true,
      node: {
        local_preferential_score: 100000000,
        local_score: 50000000,
        preferential_score: 100000000,
        public_key: 'foo',
        score: 50000000,
        weighted_local_score: 75000000,
        weighted_score: 75000000,
      },
    },
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({end, equal}) => {
    getAutopilot(args, (err, res) => {
      const [errCode, errMessage] = err || [];

      if (!!expected.error_code || !!errCode) {
        equal(errCode, expected.error_code, 'Got expected error code');
      }

      if (!!expected.error_message || !!errMessage) {
        equal(errMessage, expected.error_message, 'Got expected err message');
      }

      if (!!err) {
        return end();
      }

      equal(res.is_enabled, expected.is_enabled, 'Got is_enabled as expected');

      if (!!expected.node) {
        const [node] = res.nodes || [];

        equal(
          node.local_preferential_score,
          expected.node.local_preferential_score,
          'Local preferential score'
        );

        equal(
          node.local_score,
          expected.node.local_score,
          'Local external score'
        );

        equal(
          node.preferential_score,
          expected.node.preferential_score,
          'Preferential score'
        );

        equal(node.public_key, expected.node.public_key, 'Node public key');
        equal(node.score, expected.node.score, 'Node external score');

        equal(
          node.weighted_local_score,
          expected.node.weighted_local_score,
          'Weighted score, local representation'
        );

        equal(
          node.weighted_score,
          expected.node.weighted_score,
          'Weighted score'
        );
      }

      return end();
    });
  });
});
