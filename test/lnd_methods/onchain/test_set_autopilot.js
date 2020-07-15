const {test} = require('@alexbosworth/tap');

const {setAutopilot} = require('./../../../lnd_methods');

const makeLnd = args => {
  return {
    autopilot: {
      modifyStatus: ({}, cbk) => cbk(args.modify_status_err),
      queryScores: ({}, cbk) => cbk(),
      setScores: ({heuristic, scores}, cbk) => cbk(args.set_scores_err),
      status: ({}, cbk) => cbk(null, {active: false}),
    },
  };
};

const makeArgs = overrides => {
  const args = {
    candidate_nodes: [{
      public_key: Buffer.alloc(33).toString('hex'),
      score: 50000000,
    }],
    is_enabled: true,
    lnd: makeLnd({}),
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({candidate_nodes: undefined, is_enabled: undefined}),
    description: 'Nodes or enabled status is required',
    expected: {
      error_code: 400,
      error_message: 'ExpectedNodesOrEnabledSettingToAdjustAutopilot',
    },
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    expected: {
      error_code: 400,
      error_message: 'ExpectedAutopilotEnabledLndToSetAutopilot',
    },
  },
  {
    args: makeArgs({candidate_nodes: [{}]}),
    description: 'Candidate node public keys are required',
    expected: {
      error_code: 400,
      error_message: 'ExpectedAllCandidateNodesToHavePublicKeys',
    },
  },
  {
    args: makeArgs({
      candidate_nodes: [{public_key: Buffer.alloc(33).toString('hex')}],
    }),
    description: 'Candidate node scores are required',
    expected: {
      error_code: 400,
      error_message: 'ExpectedAllCandidateNodesToHaveScore',
    },
  },
  {
    args: makeArgs({
      candidate_nodes: [{
        public_key: Buffer.alloc(33).toString('hex'),
        score: 2e8,
      }],
    }),
    description: 'Candidate node scores must be below the max',
    expected: {
      error_code: 400,
      error_message: 'ExpectedCandidateNodesToHaveValidScores',
    },
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        set_scores_err: {
          message: '2 UNKNOWN: heuristic with name externalscore not found',
        },
      }),
    }),
    description: 'External score absent is a special error',
    expected: {
      error_code: 400,
      error_message: 'ExternalScoreHeuristicNotEnabled',
    },
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        modify_status_err: {
          message: '12 UNIMPLEMENTED: unknown service autopilotrpc.Autopilot',
        },
      }),
    }),
    description: 'Autopilot enabled is required',
    expected: {
      error_code: 400,
      error_message: 'ExpectedAuthenticatedLndToSetAutopilotStatus',
    },
  },
  {
    args: makeArgs({lnd: makeLnd({modify_status_err: 'err'})}),
    description: 'Errors are passed back',
    expected: {
      error_code: 503,
      error_message: 'UnexpectedErrorSettingAutopilotStatus',
    },
  },
  {
    args: makeArgs({lnd: makeLnd({set_scores_err: 'err'})}),
    description: 'Candidate node scores must be below the max',
    expected: {
      error_code: 503,
      error_message: 'FailedToSetAutopilotCandidateScores',
    },
  },
  {
    args: {is_enabled: true, lnd: {}},
    description: 'Set autopilot with the wrong lnd',
    expected: {
      error_code: 400,
      error_message: 'ExpectedAutopilotEnabledLndToSetAutopilot',
    },
  },
  {
    args: makeArgs({candidate_nodes: []}),
    description: 'Candidate nodes are optional',
    expected: {},
  },
  {
    args: makeArgs({is_enabled: undefined}),
    description: 'Enabled is optional',
    expected: {},
  },
  {
    args: makeArgs({candidate_nodes: undefined, is_enabled: false}),
    description: 'Set disabled',
    expected: {},
  },
  {
    args: {
      candidate_nodes: [{
        public_key: Buffer.alloc(33).toString('hex'),
        score: 50000000,
      }],
      is_enabled: true,
      lnd: {
        autopilot: {
          modifyStatus: ({}, cbk) => cbk(),
          queryScores: ({}, cbk) => cbk(),
          setScores: ({heuristic, scores}, cbk) => {
            if (scores[Buffer.alloc(33).toString('hex')] !== 0.5) {
              return cbk([500, 'ExpectedExternalScorePassed']);
            }

            if (heuristic !== 'externalscore') {
              return cbk([500, 'ExpectedExternalScoreHeuristicSpecified']);
            }

            return cbk();
          },
          status: ({}, cbk) => cbk(null, {active: false}),
        },
      },
    },
    description: 'Set enabled status',
    expected: {},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({end, equal}) => {
    setAutopilot(args, (err, res) => {
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

      return end();
    });

    return;
  });
});
