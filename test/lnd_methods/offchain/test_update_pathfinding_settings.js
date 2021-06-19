const {test} = require('@alexbosworth/tap');

const {updatePathfindingSettings} = require('./../../../lnd_methods');

const makeLnd = ({config, empty, err, overrides, setErr}) => {
  if (!!empty) {
    return {
      router: {
        getMissionControlConfig: ({}, cbk) => cbk(),
        setMissionControlConfig: ({}, cbk) => cbk(),
      },
    };
  }

  const res = {
    config: {
      half_life_seconds: 1,
      hop_probability: 0.6,
      maximum_payment_results: 10,
      minimum_failure_relax_interval: 1,
      weight: 0.5,
    },
  };

  Object.keys(overrides || {}).forEach(key => res[key] = overrides[key]);

  Object.keys(config || {}).forEach(key => res.config[key] = config[key]);

  return {
    router: {
      getMissionControlConfig: ({}, cbk) => cbk(err, res),
      setMissionControlConfig: ({}, cbk) => cbk(setErr),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is expected to get pathfinding settings',
    error: [400, 'ExpectedLndToUpdatePathfindingSettings'],
  },
  {
    args: {baseline_success_rate: -1, lnd: makeLnd({})},
    description: 'A valid baseline failure rate is expected',
    error: [400, 'ExpectedValidBaselineSuccessRateForUpdate'],
  },
  {
    args: {lnd: makeLnd({}), node_ignore_rate: -1},
    description: 'A valid node ignore rate is expected',
    error: [400, 'ExpectedValidIgnoreRateForPathfindingUpdate'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'An error is returned',
    error: [503, 'UnexpectedErrorGettingPathSettings', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({err: {details: 'unknown method'}})},
    description: 'An unsupported error is returned',
    error: [501, 'GetMissionControlConfigMethodNotSupported'],
  },
  {
    args: {lnd: makeLnd({setErr: 'err'})},
    description: 'An error is returned when setting',
    error: [503, 'UnexpectedErrorUpdatingPathingSettings', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({empty: true})},
    description: 'A response is expected',
    error: [503, 'ExpectedPathfindingSettingsResponse'],
  },
  {
    args: {lnd: makeLnd({overrides: {config: undefined}})},
    description: 'A config is expected',
    error: [503, 'ExpectedPathfindingSettingsConfigInResponse'],
  },
  {
    args: {lnd: makeLnd({config: {half_life_seconds: undefined}})},
    description: 'Half life seconds are expected',
    error: [503, 'ExpectedHalfLifeSecondsInSettingsResponse'],
  },
  {
    args: {lnd: makeLnd({config: {hop_probability: undefined}})},
    description: 'Hop probability is expected',
    error: [503, 'ExpectedAssumedHopPriorityInSettingsResponse'],
  },
  {
    args: {lnd: makeLnd({config: {maximum_payment_results: undefined}})},
    description: 'Max payments are expected',
    error: [503, 'ExpectedMaximumPaymentResultsInConfigResponse'],
  },
  {
    args: {
      lnd: makeLnd({config: {minimum_failure_relax_interval: undefined}}),
    },
    description: 'Min failure relax interval is expected',
    error: [503, 'ExpectedMinimumFailureRelaxIntervalInResponse'],
  },
  {
    args: {lnd: makeLnd({config: {weight: undefined}})},
    description: 'Node reputation weight is expected',
    error: [503, 'ExpectedWeightInSettingsConfigResponse'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Pathfinding configuration is updated when nothing passed',
  },
  {
    args: {
      baseline_success_rate: 1,
      lnd: makeLnd({}),
      max_payment_records: 1,
      node_ignore_rate: 1,
      penalty_half_life_ms: 1,
    },
    description: 'Pathfinding configuration is updated',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => updatePathfindingSettings(args), error, 'Got err');
    } else {
      const res = await updatePathfindingSettings(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
