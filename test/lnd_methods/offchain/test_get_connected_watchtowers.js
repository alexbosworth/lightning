const {test} = require('@alexbosworth/tap');

const {getConnectedWatchtowers} = require('./../../../lnd_methods');

const makeStats = overrides => {
  const stats = {
    num_backups: 1,
    num_failed_backups: 1,
    num_pending_backups: 1,
    num_sessions_acquired: 1,
    num_sessions_exhausted: 1,
  };

  Object.keys(overrides).forEach(k => stats[k] = overrides[k]);

  return stats;
};

const makeTower = overrides => {
  const tower = {
    addresses: ['address'],
    active_session_candidate: true,
    num_sessions: 1,
    pubkey: Buffer.alloc(33, 3),
    sessions: [{
      max_backups: 1,
      num_backups: 1,
      num_pending_backups: 1,
      sweep_sat_per_byte: 1,
    }],
  };

  Object.keys(overrides).forEach(k => tower[k] = overrides[k]);

  return tower;
};

const makeLnd = args => {
  return {
    tower_client: {
      listTowers: ({}, cbk) => {
        if (!!args.towersErr) {
          return cbk(args.towersErr);
        }

        if (args.towersRes !== undefined) {
          return cbk(null, args.towersRes);
        }

        return cbk(null, {towers: [makeTower({})]});
      },
      policy: ({}, cbk) => {
        if (!!args.policyErr) {
          return cbk(args.policyErr);
        }

        if (args.policyRes !== undefined) {
          return cbk(null, args.policyRes);
        }

        return cbk(null, {max_updates: 1, sweep_sat_per_byte: 1});
      },
      stats: ({}, cbk) => {
        if (!!args.statsErr) {
          return cbk(args.statsErr);
        }

        if (args.statsRes !== undefined) {
          return cbk(null, args.statsRes);
        }

        return cbk(null, makeStats({}));
      },
    },
  };
};

const makeArgs = override => {
  const args = {lnd: makeLnd({})};

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToGetWatchtowerInfo'],
  },
  {
    args: {
      lnd: makeLnd({
        policyErr: {
          message: '12 UNIMPLEMENTED: unknown service wtclientrpc.WatchtowerClient',
        },
      }),
    },
    description: 'Policy unsupported returns error',
    error: [503, 'ExpectedWatchtowerClientLndToGetPolicy'],
  },
  {
    args: {lnd: makeLnd({policyErr: 'err'})},
    description: 'Policy err returns error',
    error: [503, 'UnexpectedErrorGettingWatchtowerPolicy', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({policyRes: null})},
    description: 'Policy response is expected',
    error: [503, 'ExpectedResultForWatchtowerPolicy'],
  },
  {
    args: {lnd: makeLnd({policyRes: {}})},
    description: 'Policy max updates are expected',
    error: [503, 'ExpectedMaxUpdateCountInWatchtowerPolicyInfo'],
  },
  {
    args: {lnd: makeLnd({policyRes: {max_updates: 1}})},
    description: 'Policy sweep sats per byte are required',
    error: [503, 'ExpectedSweepSatsPerByteInWatchtowerPolicy'],
  },
  {
    args: {
      lnd: makeLnd({
        statsErr: {
          message: '12 UNIMPLEMENTED: unknown service wtclientrpc.WatchtowerClient',
        },
      }),
    },
    description: 'Stats unsupported returns error',
    error: [503, 'ExpectedWatchtowerClientLndToGetStats'],
  },
  {
    args: {lnd: makeLnd({statsErr: 'err'})},
    description: 'Stats errors returns error',
    error: [503, 'UnexpectedErrorGettingWatchtowerStats', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({statsRes: null})},
    description: 'Stats response is expected',
    error: [503, 'ExpectedResultForWatchtowerStats'],
  },
  {
    args: {lnd: makeLnd({statsRes: makeStats({num_backups: undefined})})},
    description: 'Stats num backups is expected',
    error: [503, 'ExpectedBackupsCountInWatchtowerStats'],
  },
  {
    args: {
      lnd: makeLnd({statsRes: makeStats({num_failed_backups: undefined})}),
    },
    description: 'Stats num failed backups is expected',
    error: [503, 'ExpectedFailedBackupsCountInWatchtowerStats'],
  },
  {
    args: {
      lnd: makeLnd({statsRes: makeStats({num_pending_backups: undefined})}),
    },
    description: 'Stats num pending backups is expected',
    error: [503, 'ExpectedPendingBackupsCountInWatchtowerStats'],
  },
  {
    args: {
      lnd: makeLnd({statsRes: makeStats({num_sessions_acquired: undefined})}),
    },
    description: 'Stats num sessions acquired is expected',
    error: [503, 'ExpectedSessionsCountInWatchtowerStats'],
  },
  {
    args: {
      lnd: makeLnd({statsRes: makeStats({num_sessions_exhausted: undefined})}),
    },
    description: 'Stats num sessions exhausted is expected',
    error: [503, 'ExpectedExhaustedSessionsCountInTowerStats'],
  },
  {
    args: {
      lnd: makeLnd({
        towersErr: {
          message: '12 UNIMPLEMENTED: unknown service wtclientrpc.WatchtowerClient',
        },
      }),
    },
    description: 'Towers unsupported returns error',
    error: [503, 'ExpectedWatchtowerClientLndToGetTowers'],
  },
  {
    args: {lnd: makeLnd({towersErr: 'err'})},
    description: 'Towers errors returns error',
    error: [503, 'UnexpectedErrorGettingWatchtowersList', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({towersRes: null})},
    description: 'Towers response is expected',
    error: [503, 'ExpectedResultForWatchtowerListing'],
  },
  {
    args: {lnd: makeLnd({towersRes: {}})},
    description: 'Towers array is expected',
    error: [503, 'ExpectedArrayOfTowersForWatchtowerListing'],
  },
  {
    args: {
      lnd: makeLnd({towersRes: {towers: [makeTower({pubkey: undefined})]}}),
    },
    description: 'Tower public key is expected',
    error: [503, 'ExpectedPublicKeyForWatchtower'],
  },
  {
    args: {
      lnd: makeLnd({towersRes: {towers: [makeTower({addresses: undefined})]}}),
    },
    description: 'Tower addresses are expected',
    error: [503, 'ExpectedAddressesForWatchtower'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Connected watchtowers are returned',
    expected: {
      backups_count: 1,
      failed_backups_count: 1,
      finished_sessions_count: 1,
      max_session_update_count: 1,
      pending_backups_count: 1,
      sessions_count: 1,
      sweep_tokens_per_vbyte: 1,
      towers: [{
        is_active: true,
        public_key: '030303030303030303030303030303030303030303030303030303030303030303',
        sessions: [{
          backups_count: 1,
          max_backups_count: 1,
          pending_backups_count: 1,
          sweep_tokens_per_vbyte: 1,
        }],
        sockets: ['address'],
      }],
    },
  },
  {
    args: {lnd: makeLnd({towersRes: {towers: [makeTower({sessions: null})]}})},
    description: 'Connected watchtowers with no sessions are returned',
    expected: {
      backups_count: 1,
      failed_backups_count: 1,
      finished_sessions_count: 1,
      max_session_update_count: 1,
      pending_backups_count: 1,
      sessions_count: 1,
      sweep_tokens_per_vbyte: 1,
      towers: [{
        is_active: true,
        public_key: '030303030303030303030303030303030303030303030303030303030303030303',
        sessions: [],
        sockets: ['address'],
      }],
    },
  },
  {
    args: {is_anchor: true, lnd: makeLnd({})},
    description: 'Anchor watchtowers are returned',
    expected: {
      backups_count: 1,
      failed_backups_count: 1,
      finished_sessions_count: 1,
      max_session_update_count: 1,
      pending_backups_count: 1,
      sessions_count: 1,
      sweep_tokens_per_vbyte: 1,
      towers: [{
        is_active: true,
        public_key: '030303030303030303030303030303030303030303030303030303030303030303',
        sessions: [{
          backups_count: 1,
          max_backups_count: 1,
          pending_backups_count: 1,
          sweep_tokens_per_vbyte: 1,
        }],
        sockets: ['address'],
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(getConnectedWatchtowers(args), error, 'Got error');
    } else {
      strictSame(await getConnectedWatchtowers(args), expected, 'Got result');
    }

    return end();
  });
});
